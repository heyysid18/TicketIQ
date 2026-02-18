from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Min
from django.utils import timezone
from .models import Ticket
from .serializers import TicketSerializer, TicketCreateSerializer, TicketUpdateSerializer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    
    def get_queryset(self):
        # Order by newest first
        queryset = Ticket.objects.all().order_by('-created_at')
        
        # Filters
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        
        if category:
            queryset = queryset.filter(category=category)
        if priority:
            queryset = queryset.filter(priority=priority)
        if status:
            queryset = queryset.filter(status=status)
            
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
            
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return TicketCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TicketUpdateSerializer
        return TicketSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Returns aggregated statistics about tickets.
        Uses database-level aggregation (count, min, annotate) to ensure O(1) performance
        relative to dataset size, avoiding inaccurate or slow Python-side loops.
        """
        total_tickets = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(status='open').count()
        
        # Date stats
        first_ticket = Ticket.objects.aggregate(first_created=Min('created_at'))
        first_created = first_ticket['first_created']
        
        avg_tickets_per_day = 0.0
        if first_created and total_tickets > 0:
            days = (timezone.now() - first_created).days
            # If 0 days (created today), count as 1 to limit average to total
            days = max(days, 1) 
            avg_tickets_per_day = round(total_tickets / days, 2)

        # Breakdowns using aggregation
        # We start with default 0s for structure
        priority_breakdown = {k: 0 for k, _ in Ticket.PRIORITY_CHOICES}
        priority_counts = Ticket.objects.values('priority').annotate(count=Count('id'))
        for item in priority_counts:
            priority_breakdown[item['priority']] = item['count']

        category_breakdown = {k: 0 for k, _ in Ticket.CATEGORY_CHOICES}
        category_counts = Ticket.objects.values('category').annotate(count=Count('id'))
        for item in category_counts:
            category_breakdown[item['category']] = item['count']

        return Response({
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "avg_tickets_per_day": avg_tickets_per_day,
            "priority_breakdown": priority_breakdown,
            "category_breakdown": category_breakdown
        })

    @action(detail=False, methods=['post'])
    def classify(self, request):
        description = request.data.get('description')
        if not description:
            return Response({"error": "Description is required"}, status=400)
        
        from .ai_service import AIService
        ai_service = AIService()
        
        result = ai_service.classify_ticket(description)
        
        if result:
            return Response(result)
        else:
            return Response({"suggested_category": None, "suggested_priority": None})
