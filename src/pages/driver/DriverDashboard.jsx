import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Gauge, Clock, ClipboardCheck, Plus, AlertTriangle, Loader2, CheckCircle, ChevronRight, Fuel } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Badge } from '../../components/ui';
import { expenseService, checklistService } from '../../services';
import { authService } from '../../services';
import './DriverDashboard.css';
import './DriverLayout.css';

export function DriverDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [todayChecklist, setTodayChecklist] = useState(null);
    const [driverInfo, setDriverInfo] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Get driver info
            const driver = authService.getCurrentDriver();
            const user = authService.getCurrentUser();
            setDriverInfo(driver || { name: user?.name || 'Driver' });

            // Fetch expenses
            const expensesRes = await expenseService.getAll();
            setRecentExpenses((expensesRes.data || []).slice(0, 3));

            // Fetch today's checklist if driver has vehicle
            if (driver?.assignedVehicles?.[0]) {
                const checklistRes = await checklistService.getToday(
                    driver.assignedVehicles[0]._id || driver.assignedVehicles[0],
                    driver._id
                );
                setTodayChecklist(checklistRes.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock vehicle data for demo
    const vehicle = {
        vehicleNumber: 'MH-12-AB-1234',
        model: 'Schwing Stetter AM 9',
        currentOdometer: 45230,
        engineHours: 1850
    };

    const checklistCompleted = todayChecklist?.allChecked || false;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 size={32} className="spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Welcome Header */}
            <div className="driver-page-header">
                <h1 className="driver-page-title">Welcome, {driverInfo?.name || 'Driver'}!</h1>
                <p className="driver-page-subtitle">Here's your vehicle status for today</p>
            </div>

            {/* Vehicle Card */}
            <div className="driver-vehicle-card">
                <div className="driver-vehicle-header">
                    <div>
                        <div className="driver-vehicle-number">{vehicle.vehicleNumber}</div>
                        <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginTop: '4px' }}>{vehicle.model}</div>
                    </div>
                    <span className="driver-vehicle-status">Active</span>
                </div>

                <div className="driver-vehicle-info">
                    <div className="driver-vehicle-stat">
                        <div className="driver-vehicle-stat-label">
                            <Gauge size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Odometer
                        </div>
                        <div className="driver-vehicle-stat-value">
                            {vehicle.currentOdometer.toLocaleString()} km
                        </div>
                    </div>
                    <div className="driver-vehicle-stat">
                        <div className="driver-vehicle-stat-label">
                            <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Engine Hours
                        </div>
                        <div className="driver-vehicle-stat-value">
                            {vehicle.engineHours} hrs
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Alert */}
            <div
                className={`checklist-alert ${checklistCompleted ? 'completed' : ''}`}
                onClick={() => navigate('/driver/checklist')}
            >
                <div className="checklist-alert-icon">
                    {checklistCompleted ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div className="checklist-alert-content">
                    <div className="checklist-alert-title">
                        {checklistCompleted ? 'Checklist Completed' : 'Daily Checklist Pending'}
                    </div>
                    <div className="checklist-alert-text">
                        {checklistCompleted
                            ? 'Your vehicle is ready for today\'s trips'
                            : 'Complete your checklist before starting the trip'}
                    </div>
                </div>
                <ChevronRight size={20} className="checklist-alert-arrow" />
            </div>

            {/* Quick Actions */}
            <div className="driver-quick-actions">
                <Link to="/driver/checklist" className="driver-action-card">
                    <div className="driver-action-icon blue">
                        <ClipboardCheck size={24} />
                    </div>
                    <div className="driver-action-content">
                        <h4>Daily Checklist</h4>
                        <p>Complete inspection</p>
                    </div>
                </Link>
                <Link to="/driver/expenses" className="driver-action-card">
                    <div className="driver-action-icon green">
                        <Plus size={24} />
                    </div>
                    <div className="driver-action-content">
                        <h4>Add Expense</h4>
                        <p>Submit expenses</p>
                    </div>
                </Link>
            </div>

            {/* Recent Expenses */}
            <div className="driver-section">
                <div className="driver-section-header">
                    <h3 className="driver-section-title">Recent Expenses</h3>
                    <Link to="/driver/expenses" className="driver-section-link">View All</Link>
                </div>

                {recentExpenses.length === 0 ? (
                    <Card>
                        <p style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--grey-500)' }}>
                            No recent expenses
                        </p>
                    </Card>
                ) : (
                    <div className="expense-list">
                        {recentExpenses.map((expense) => (
                            <div key={expense._id} className="expense-list-item">
                                <div className="expense-list-left">
                                    <div className="expense-list-icon" style={{ background: 'var(--blue-100)', color: 'var(--blue-600)' }}>
                                        <Fuel size={18} />
                                    </div>
                                    <div className="expense-list-info">
                                        <h4>{expense.type}</h4>
                                        <p>{new Date(expense.date || expense.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                                <div className="expense-list-right">
                                    <div className="expense-list-amount">₹{expense.amount?.toLocaleString()}</div>
                                    <Badge variant={expense.status?.toLowerCase()}>{expense.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DriverDashboard;
