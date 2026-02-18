import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TicketList = ({ refreshTrigger }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        priority: '',
        status: '',
        search: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const response = await axios.get(`${API_URL}/api/tickets/?${params.toString()}`);
            setTickets(response.data);
        } catch (err) {
            console.error("Error fetching tickets:", err);
        } finally {
            setLoading(false);
        }
    }, [filters, API_URL]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets, refreshTrigger]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.patch(`${API_URL}/api/tickets/${id}/`, { status: newStatus });
            // Optimistic update
            setTickets(prev => prev.map(ticket =>
                ticket.id === id ? { ...ticket, status: newStatus } : ticket
            ));
        } catch (err) {
            console.error("Error updating ticket status:", err);
            alert("Failed to update status");
            fetchTickets(); // Revert on error
        }
    };

    return (
        <div className="ticket-list-container">
            <div className="filters">
                <input
                    type="text"
                    name="search"
                    placeholder="Search items..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="search-input"
                />

                <select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All Categories</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                    <option value="account">Account</option>
                    <option value="general">General</option>
                </select>

                <select name="priority" value={filters.priority} onChange={handleFilterChange}>
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>

                <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {loading ? (
                <p>Loading tickets...</p>
            ) : (
                <div className="ticket-grid">
                    {tickets.length === 0 ? (
                        <p>No tickets found matching your filters.</p>
                    ) : (
                        tickets.map(ticket => (
                            <div key={ticket.id} className={`ticket-card border-${ticket.priority}`}>
                                <div className="ticket-header">
                                    <h3>{ticket.title}</h3>
                                    <span className={`badge status-${ticket.status}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <p className="ticket-desc">
                                    {ticket.description.length > 100
                                        ? ticket.description.substring(0, 100) + '...'
                                        : ticket.description}
                                </p>

                                <div className="ticket-meta">
                                    <span className="badge category">{ticket.category}</span>
                                    <span className={`badge priority-${ticket.priority}`}>{ticket.priority}</span>
                                    <small>{new Date(ticket.created_at).toLocaleDateString()}</small>
                                </div>

                                <div className="ticket-actions">
                                    <label>Update Status:</label>
                                    <select
                                        value={ticket.status}
                                        onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <style>{`
        .ticket-list-container {
          margin-top: 2rem;
        }
        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .search-input {
          flex: 2;
          min-width: 200px;
        }
        .filters select, .filters input {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #555;
          background: #222;
          color: white;
        }
        .ticket-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .ticket-card {
          background: #333;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          text-align: left;
          transition: transform 0.2s;
        }
        .ticket-card:hover {
          transform: translateY(-2px);
        }
        .border-critical { border-left: 4px solid #ff4444; }
        .border-high { border-left: 4px solid #ffbb33; }
        .border-medium { border-left: 4px solid #00C851; }
        .border-low { border-left: 4px solid #33b5e5; }
        
        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .ticket-header h3 {
          margin: 0;
          font-size: 1.2rem;
          word-break: break-word;
        }
        .ticket-desc {
          color: #ccc;
          flex-grow: 1;
          margin-bottom: 1rem;
        }
        .ticket-meta {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 1rem;
          font-size: 0.85rem;
        }
        .badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-transform: capitalize;
          font-size: 0.8rem;
        }
        .category { background: #4a4a4a; }
        .priority-critical { background: rgba(255, 68, 68, 0.2); color: #ff4444; }
        .priority-high { background: rgba(255, 187, 51, 0.2); color: #ffbb33; }
        .priority-medium { background: rgba(0, 200, 81, 0.2); color: #00C851; }
        .priority-low { background: rgba(51, 181, 229, 0.2); color: #33b5e5; }
        
        .status-open { background: #007bff; color: white; }
        .status-in_progress { background: #ffc107; color: black; }
        .status-resolved { background: #28a745; color: white; }
        .status-closed { background: #6c757d; color: white; }

        .ticket-actions {
          border-top: 1px solid #444;
          padding-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-select {
          background: #222;
          color: white;
          border: 1px solid #555;
          padding: 0.25rem;
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
};

export default TicketList;
