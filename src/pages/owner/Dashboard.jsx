import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, FileWarning, DollarSign, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, StatsCard, Badge, Button } from '../../components/ui';
import { vehicleService, driverService, documentService, expenseService } from '../../services';
import './Dashboard.css';

export function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeDrivers: 0,
        expiringDocs: 0,
        pendingExpenses: 0
    });
    const [pendingExpenses, setPendingExpenses] = useState([]);
    const [expiringDocs, setExpiringDocs] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [vehiclesRes, driversRes, docsRes, expensesRes, expSummaryRes] = await Promise.all([
                vehicleService.getAll(),
                driverService.getAll(),
                documentService.getExpiring(),
                expenseService.getAll({ status: 'Pending' }),
                expenseService.getSummary()
            ]);

            const vehicles = vehiclesRes.data || [];
            const drivers = driversRes.data || [];
            const expDocs = docsRes.data || [];
            const expenses = expensesRes.data || [];
            const summary = expSummaryRes.data || {};

            setStats({
                totalVehicles: vehicles.length,
                activeDrivers: drivers.filter(d => d.status === 'Active').length,
                expiringDocs: expDocs.length,
                pendingExpenses: summary.pendingCount || 0
            });

            setPendingExpenses(expenses.slice(0, 5));
            setExpiringDocs(expDocs.slice(0, 3));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 size={32} className="spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back! Here's your fleet overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatsCard
                    title="Total Vehicles"
                    value={stats.totalVehicles}
                    icon={Truck}
                    variant="primary"
                />
                <StatsCard
                    title="Active Drivers"
                    value={stats.activeDrivers}
                    icon={Users}
                    variant="success"
                />
                <StatsCard
                    title="Expiring Documents"
                    value={stats.expiringDocs}
                    icon={FileWarning}
                    variant={stats.expiringDocs > 0 ? 'warning' : 'secondary'}
                />
                <StatsCard
                    title="Pending Expenses"
                    value={stats.pendingExpenses}
                    icon={DollarSign}
                    variant={stats.pendingExpenses > 0 ? 'warning' : 'secondary'}
                />
            </div>

            {/* Alerts */}
            {(stats.expiringDocs > 0 || stats.pendingExpenses > 0) && (
                <Card className="dashboard-alert">
                    <div className="dashboard-alert-content">
                        <AlertTriangle size={24} />
                        <div>
                            <h4>Action Required</h4>
                            <p>
                                {stats.expiringDocs > 0 && `${stats.expiringDocs} document(s) expiring soon. `}
                                {stats.pendingExpenses > 0 && `${stats.pendingExpenses} expense(s) pending approval.`}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <div className="dashboard-grid">
                {/* Pending Expenses */}
                <Card className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h3>Pending Expenses</h3>
                        <Button variant="secondary" size="sm" onClick={() => navigate('/owner/expenses')}>
                            View All
                        </Button>
                    </div>

                    {pendingExpenses.length === 0 ? (
                        <p className="empty-state">No pending expenses</p>
                    ) : (
                        <div className="pending-expenses-list">
                            {pendingExpenses.map((expense) => (
                                <div key={expense._id} className="pending-expense-item">
                                    <div className="pending-expense-info">
                                        <span className="pending-expense-type">{expense.type}</span>
                                        <span className="pending-expense-vehicle">
                                            {expense.vehicle?.vehicleNumber} • {expense.driver?.name}
                                        </span>
                                    </div>
                                    <div className="pending-expense-amount">
                                        ₹{expense.amount?.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Expiring Documents */}
                <Card className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h3>Expiring Documents</h3>
                        <Button variant="secondary" size="sm" onClick={() => navigate('/owner/documents')}>
                            View All
                        </Button>
                    </div>

                    {expiringDocs.length === 0 ? (
                        <p className="empty-state">No documents expiring soon</p>
                    ) : (
                        <div className="expiring-docs-list">
                            {expiringDocs.map((doc) => {
                                const daysUntil = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={doc._id} className="expiring-doc-item">
                                        <div className="expiring-doc-info">
                                            <span className="expiring-doc-type">{doc.type}</span>
                                            <span className="expiring-doc-vehicle">
                                                {doc.vehicle?.vehicleNumber}
                                            </span>
                                        </div>
                                        <Badge variant={daysUntil < 0 ? 'expired' : 'expiring'}>
                                            {daysUntil < 0 ? 'Expired' : `${daysUntil} days`}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="dashboard-card recent-activity">
                <div className="dashboard-card-header">
                    <h3>Recent Activity</h3>
                </div>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon">
                            <Clock size={16} />
                        </div>
                        <div className="activity-content">
                            <p>Dashboard loaded with live data</p>
                            <span>Just now</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default Dashboard;
