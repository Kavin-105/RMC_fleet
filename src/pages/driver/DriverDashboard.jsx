import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Gauge, Clock, ClipboardCheck, Plus, AlertTriangle, Loader2, CheckCircle, ChevronRight, Fuel, IndianRupee, Activity, Wrench, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Badge } from '../../components/ui';
import { expenseService, checklistService, vehicleService } from '../../services';
import { authService } from '../../services';
import './DriverDashboard.css';
import './DriverLayout.css';

const typeIcons = {
    Fuel: { icon: Fuel, color: '#3b82f6', bg: '#eff6ff' },
    Maintenance: { icon: Wrench, color: '#f59e0b', bg: '#fffbeb' },
    Toll: { icon: IndianRupee, color: '#8b5cf6', bg: '#f5f3ff' },
    'Spare Parts': { icon: Wrench, color: '#ef4444', bg: '#fef2f2' },
    Other: { icon: Receipt, color: '#6b7280', bg: '#f9fafb' }
};

export function DriverDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allExpenses, setAllExpenses] = useState([]);
    const [todayChecklist, setTodayChecklist] = useState(null);
    const [driverInfo, setDriverInfo] = useState(null);
    const [healthScore, setHealthScore] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const driver = authService.getCurrentDriver();
            const user = authService.getCurrentUser();
            setDriverInfo(driver || { name: user?.name || 'Driver' });

            const expensesRes = await expenseService.getAll();
            setAllExpenses(expensesRes.data || []);

            if (driver?.assignedVehicles?.[0]) {
                const vehicleId = driver.assignedVehicles[0]._id || driver.assignedVehicles[0];
                const checklistRes = await checklistService.getToday(vehicleId, driver._id);
                setTodayChecklist(checklistRes.data);

                try {
                    const healthRes = await vehicleService.getHealthScore(vehicleId);
                    setHealthScore(healthRes.data);
                } catch { /* ignore */ }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const assignedVehicle = driverInfo?.assignedVehicles?.[0];
    const vehicle = assignedVehicle ? {
        vehicleNumber: assignedVehicle.vehicleNumber || 'Not Assigned',
        model: assignedVehicle.model || 'Unknown Model',
        currentOdometer: assignedVehicle.currentOdometer || 0,
        engineHours: assignedVehicle.engineHours || 0,
        status: assignedVehicle.status || 'active'
    } : null;

    const checklistCompleted = todayChecklist?.allChecked || false;
    const recentExpenses = allExpenses.slice(0, 3);

    // Analytics calculations
    const totalExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const approvedExpenses = allExpenses.filter(e => e.status === 'Approved');
    const pendingExpenses = allExpenses.filter(e => e.status === 'Pending');
    const approvedTotal = approvedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Expense by type
    const expenseByType = {};
    allExpenses.forEach(e => {
        expenseByType[e.type] = (expenseByType[e.type] || 0) + (e.amount || 0);
    });
    const typeEntries = Object.entries(expenseByType).sort((a, b) => b[1] - a[1]);

    // Monthly breakdown (last 4 months)
    const monthlyData = {};
    allExpenses.forEach(e => {
        const d = new Date(e.date || e.createdAt);
        const key = d.toLocaleString('default', { month: 'short' });
        monthlyData[key] = (monthlyData[key] || 0) + (e.amount || 0);
    });
    const monthEntries = Object.entries(monthlyData).slice(-4);
    const maxMonthly = Math.max(...monthEntries.map(([, v]) => v), 1);

    const getScoreColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 75) return '#3b82f6';
        if (score >= 60) return '#f59e0b';
        if (score >= 40) return '#f97316';
        return '#ef4444';
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
            <div className="driver-page-header">
                <h1 className="driver-page-title">Welcome, {driverInfo?.name || 'Driver'}!</h1>
                <p className="driver-page-subtitle">Here's your vehicle status for today</p>
            </div>

            {/* Vehicle Card */}
            {vehicle ? (
                <div className="driver-vehicle-card">
                    <div className="driver-vehicle-header">
                        <div>
                            <div className="driver-vehicle-number">{vehicle.vehicleNumber}</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9, marginTop: '4px' }}>{vehicle.model}</div>
                        </div>
                        <span className="driver-vehicle-status" style={{
                            background: vehicle.status === 'active' ? 'var(--green-500)' : 'var(--grey-400)'
                        }}>
                            {vehicle.status?.charAt(0).toUpperCase() + vehicle.status?.slice(1) || 'Active'}
                        </span>
                    </div>
                    <div className="driver-vehicle-info">
                        <div className="driver-vehicle-stat">
                            <div className="driver-vehicle-stat-label">
                                <Gauge size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Odometer
                            </div>
                            <div className="driver-vehicle-stat-value">{vehicle.currentOdometer.toLocaleString()} km</div>
                        </div>
                        <div className="driver-vehicle-stat">
                            <div className="driver-vehicle-stat-label">
                                <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Engine Hours
                            </div>
                            <div className="driver-vehicle-stat-value">{vehicle.engineHours} hrs</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="driver-vehicle-card" style={{ background: 'var(--grey-100)', color: 'var(--grey-600)' }}>
                    <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                        <Truck size={48} style={{ opacity: 0.5, marginBottom: 'var(--space-2)' }} />
                        <p style={{ margin: 0, fontWeight: 500 }}>No Vehicle Assigned</p>
                        <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-sm)' }}>Please contact your fleet manager</p>
                    </div>
                </div>
            )}

            {/* Stats Summary Row */}
            <div className="driver-stats-row">
                <div className="driver-stat-card">
                    <div className="driver-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <IndianRupee size={18} />
                    </div>
                    <div className="driver-stat-info">
                        <span className="driver-stat-value">₹{totalExpenses.toLocaleString('en-IN')}</span>
                        <span className="driver-stat-label">Total Expenses</span>
                    </div>
                </div>
                <div className="driver-stat-card">
                    <div className="driver-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <CheckCircle size={18} />
                    </div>
                    <div className="driver-stat-info">
                        <span className="driver-stat-value">{approvedExpenses.length}</span>
                        <span className="driver-stat-label">Approved</span>
                    </div>
                </div>
                <div className="driver-stat-card">
                    <div className="driver-stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                        <Clock size={18} />
                    </div>
                    <div className="driver-stat-info">
                        <span className="driver-stat-value">{pendingExpenses.length}</span>
                        <span className="driver-stat-label">Pending</span>
                    </div>
                </div>
                {healthScore && (
                    <div className="driver-stat-card">
                        <div className="driver-stat-icon" style={{ background: `${getScoreColor(healthScore.healthScore)}15`, color: getScoreColor(healthScore.healthScore) }}>
                            <Activity size={18} />
                        </div>
                        <div className="driver-stat-info">
                            <span className="driver-stat-value">{healthScore.healthScore}/100</span>
                            <span className="driver-stat-label">Health Score</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Checklist Alert */}
            <div className={`checklist-alert ${checklistCompleted ? 'completed' : ''}`} onClick={() => navigate('/driver/checklist')}>
                <div className="checklist-alert-icon">
                    {checklistCompleted ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div className="checklist-alert-content">
                    <div className="checklist-alert-title">{checklistCompleted ? 'Checklist Completed' : 'Daily Checklist Pending'}</div>
                    <div className="checklist-alert-text">{checklistCompleted ? 'Your vehicle is ready for today\'s trips' : 'Complete your checklist before starting the trip'}</div>
                </div>
                <ChevronRight size={20} className="checklist-alert-arrow" />
            </div>

            {/* Quick Actions */}
            <div className="driver-quick-actions">
                <Link to="/driver/checklist" className="driver-action-card">
                    <div className="driver-action-icon blue"><ClipboardCheck size={24} /></div>
                    <div className="driver-action-content"><h4>Daily Checklist</h4><p>Complete inspection</p></div>
                </Link>
                <Link to="/driver/expenses" className="driver-action-card">
                    <div className="driver-action-icon green"><Plus size={24} /></div>
                    <div className="driver-action-content"><h4>Add Expense</h4><p>Submit expenses</p></div>
                </Link>
                <Link to="/driver/engine-health" className="driver-action-card">
                    <div className="driver-action-icon orange"><Activity size={24} /></div>
                    <div className="driver-action-content"><h4>Engine Health</h4><p>Run diagnostics</p></div>
                </Link>
            </div>

            {/* Expense Analytics Section */}
            {allExpenses.length > 0 && (
                <div className="driver-analytics-section">
                    {/* Expense by Type */}
                    <Card className="driver-analytics-card">
                        <h3 className="driver-analytics-title">Expense Breakdown</h3>
                        <div className="driver-expense-types">
                            {typeEntries.map(([type, amount]) => {
                                const config = typeIcons[type] || typeIcons.Other;
                                const Icon = config.icon;
                                const pct = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(0) : 0;
                                return (
                                    <div key={type} className="driver-type-row">
                                        <div className="driver-type-left">
                                            <div className="driver-type-icon" style={{ background: config.bg, color: config.color }}>
                                                <Icon size={14} />
                                            </div>
                                            <span>{type}</span>
                                        </div>
                                        <div className="driver-type-right">
                                            <div className="driver-type-bar-track">
                                                <div className="driver-type-bar-fill" style={{ width: `${pct}%`, background: config.color }} />
                                            </div>
                                            <span className="driver-type-amount">₹{amount.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Monthly Trend */}
                    {monthEntries.length > 1 && (
                        <Card className="driver-analytics-card">
                            <h3 className="driver-analytics-title">Monthly Expenses</h3>
                            <div className="driver-monthly-chart">
                                {monthEntries.map(([month, amount]) => {
                                    const height = Math.max((amount / maxMonthly) * 100, 8);
                                    return (
                                        <div key={month} className="driver-month-col">
                                            <div className="driver-month-amount">₹{(amount / 1000).toFixed(1)}k</div>
                                            <div className="driver-month-bar" style={{ height: `${height}px` }} />
                                            <div className="driver-month-label">{month}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Recent Expenses */}
            <div className="driver-section">
                <div className="driver-section-header">
                    <h3 className="driver-section-title">Recent Expenses</h3>
                    <Link to="/driver/expenses" className="driver-section-link">View All</Link>
                </div>
                {recentExpenses.length === 0 ? (
                    <Card>
                        <p style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--grey-500)' }}>No recent expenses</p>
                    </Card>
                ) : (
                    <div className="expense-list">
                        {recentExpenses.map((expense) => {
                            const config = typeIcons[expense.type] || typeIcons.Other;
                            const Icon = config.icon;
                            return (
                                <div key={expense._id} className="expense-list-item">
                                    <div className="expense-list-left">
                                        <div className="expense-list-icon" style={{ background: config.bg, color: config.color }}>
                                            <Icon size={18} />
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DriverDashboard;
