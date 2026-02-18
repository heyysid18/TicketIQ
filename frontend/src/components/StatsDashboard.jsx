import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const StatsDashboard = ({ refreshTrigger }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/tickets/stats/`);
            setStats(response.data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats, refreshTrigger]);

    if (loading) return <div className="stats-loading">Loading stats...</div>;
    if (!stats) return null;

    return (
        <div className="dashboard">
            <div className="stats-grid main-stats">
                <div className="stat-card">
                    <h3>Total Tickets</h3>
                    <div className="value">{stats.total_tickets}</div>
                </div>
                <div className="stat-card">
                    <h3>Open Tickets</h3>
                    <div className="value">{stats.open_tickets}</div>
                </div>
                <div className="stat-card">
                    <h3>Avg / Day</h3>
                    <div className="value">{stats.avg_tickets_per_day}</div>
                </div>
            </div>

            <div className="stats-grid breakdowns">
                <div className="breakdown-card">
                    <h3>Priority</h3>
                    <div className="breakdown-list">
                        {Object.entries(stats.priority_breakdown).map(([key, value]) => (
                            <div key={key} className="breakdown-item">
                                <span className={`label priority-${key}`}>{key}</span>
                                <span className="count">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="breakdown-card">
                    <h3>Category</h3>
                    <div className="breakdown-list">
                        {Object.entries(stats.category_breakdown).map(([key, value]) => (
                            <div key={key} className="breakdown-item">
                                <span className="label">{key}</span>
                                <span className="count">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .dashboard {
          margin-bottom: 2rem;
        }
        .stats-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .main-stats {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
        .breakdowns {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        .stat-card, .breakdown-card {
          background: #333;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }
        .stat-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stat-card .value {
          font-size: 2rem;
          font-weight: bold;
          color: #fff;
        }
        .breakdown-card h3 {
          margin-top: 0;
          border-bottom: 1px solid #444;
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }
        .breakdown-item .label {
          text-transform: capitalize;
        }
        .priority-critical { color: #ff4444; }
        .priority-high { color: #ffbb33; }
        .priority-medium { color: #00C851; }
        .priority-low { color: #33b5e5; }
        .stats-loading {
          text-align: center;
          color: #666;
          padding: 1rem;
        }
      `}</style>
        </div>
    );
};

export default StatsDashboard;
