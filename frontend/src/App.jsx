import { useState } from 'react'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import StatsDashboard from './components/StatsDashboard'
import './App.css'

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleTicketCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    }

    return (
        <div className="container">
            <h1>Support Ticket System</h1>

            <TicketForm onTicketCreated={handleTicketCreated} />

            <hr className="divider" />

            <StatsDashboard refreshTrigger={refreshTrigger} />

            <TicketList refreshTrigger={refreshTrigger} />

            <style>{`
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                .divider {
                    margin: 2rem 0;
                    border: 0;
                    border-top: 1px solid #444;
                }
            `}</style>
        </div>
    )
}

export default App
