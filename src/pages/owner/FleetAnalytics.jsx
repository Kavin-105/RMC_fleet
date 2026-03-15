import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Truck, IndianRupee, Fuel, Wrench, Loader2, RefreshCw, Calendar, CircleDollarSign, Package, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, FileText, CheckCircle, XCircle, Clock, Users, Shield, Heart, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui';
import { vehicleService } from '../../services';
import './FleetAnalytics.css';

const typeConfig = {
    Fuel: { icon: Fuel, color: '#3b82f6', bg: '#eff6ff' },
    Maintenance: { icon: Wrench, color: '#f59e0b', bg: '#fffbeb' },
    Toll: { icon: CircleDollarSign, color: '#8b5cf6', bg: '#f5f3ff' },
    'Spare Parts': { icon: Package, color: '#ef4444', bg: '#fef2f2' },
    Other: { icon: CircleDollarSign, color: '#6b7280', bg: '#f9fafb' }
};

function DonutChart({ entries, total }) {
    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const colors = entries.map(([type]) => (typeConfig[type] || typeConfig.Other).color);

    return (
        <div className="donut-container" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                {entries.map(([type, amount], i) => {
                    const pct = total > 0 ? amount / total : 0;
                    const dash = pct * circumference;
                    const gap = circumference - dash;
                    const currentOffset = offset;
                    offset += dash;
                    return (
                        <circle key={type} cx={size / 2} cy={size / 2} r={radius} fill="none"
                            stroke={colors[i]} strokeWidth={strokeWidth}
                            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-currentOffset}
                            strokeLinecap="butt"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                    );
                })}
            </svg>
            <div className="donut-center">
                <span className="donut-total">₹{(total || 0).toLocaleString('en-IN')}</span>
                <span className="donut-label">Total</span>
            </div>
        </div>
    );
}

function ProgressRing({ value, size = 64, strokeWidth = 6, color = '#3b82f6' }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(100, Math.max(0, value));
    const dashOffset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
                    strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={dashOffset}
                    strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '14px', fontWeight: 800, color }}>{value}%</div>
        </div>
    );
}

export function FleetAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        fetchAnalytics(selectedVehicle);
    }, [selectedVehicle]);

    const fetchVehicles = async () => {
        try {
            const res = await vehicleService.getAll();
            setVehicles(res.data);
        } catch (error) {
            console.error('Vehicles fetch error:', error);
        }
    };

    const fetchAnalytics = async (vehicleId = '') => {
        setLoading(true);
        try {
            const res = await vehicleService.getFleetAnalytics(vehicleId);
            setData(res.data);
        } catch (error) {
            console.error('Analytics error:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const fmt = (val) => '₹' + (val || 0).toLocaleString('en-IN');

    if (loading) {
        return <div className="analytics-loading"><Loader2 size={32} className="spin" /></div>;
    }

    if (!data) {
        return (
            <div className="analytics-empty">
                <BarChart3 size={48} />
                <h3>No Analytics Data</h3>
                <p>Add vehicles and expenses to see analytics here.</p>
            </div>
        );
    }

    const {
        totalVehicles = 0, activeVehicles = 0, maintenanceVehicles = 0, inactiveVehicles = 0,
        totalExpense = 0, pendingExpenseCount = 0, pendingExpenseTotal = 0,
        expenseByType = {}, monthlyExpenses = {}, vehicleCosts = [],
        totalDocuments = 0, expiredDocuments = 0, expiringSoonDocuments = 0, validDocuments = 0, docsByType = {},
        checklistComplianceToday = 0, todayChecklistsDone = 0, totalChecklistsLast30 = 0, issuesReported = 0,
        healthSummary = {}, totalDrivers = 0, activeDrivers = 0, driversWithVehicles = 0, unassignedVehicles = 0
    } = data;

    const avgPerVehicle = totalVehicles > 0 ? Math.round(totalExpense / totalVehicles) : 0;
    const expenseEntries = Object.entries(expenseByType).sort((a, b) => b[1] - a[1]);
    const monthEntries = Object.entries(monthlyExpenses);
    const maxMonthly = Math.max(...monthEntries.map(([, v]) => v), 1);
    const maxVehicleCost = Math.max(...vehicleCosts.map(v => v.totalCost), 1);

    const monthValues = monthEntries.map(([, v]) => v);
    const lastMonth = monthValues[monthValues.length - 1] || 0;
    const prevMonth = monthValues[monthValues.length - 2] || 0;
    const trendPct = prevMonth > 0 ? (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1) : 0;
    const trendUp = lastMonth >= prevMonth;

    const docCompliancePct = totalDocuments > 0 ? Math.round((validDocuments / totalDocuments) * 100) : 100;
    const healthyPct = totalVehicles > 0 ? Math.round(((healthSummary.healthy || 0) / totalVehicles) * 100) : 0;

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <div>
                    <h1 className="page-title">Fleet Analytics</h1>
                    <p className="page-subtitle">Comprehensive fleet performance & compliance insights</p>
                </div>
                <div className="analytics-actions">
                    <select
                        className="analytics-vehicle-filter"
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                    >
                        <option value="">All Vehicles</option>
                        {vehicles.map(v => (
                            <option key={v._id} value={v._id}>
                                {v.vehicleNumber} ({v.model})
                            </option>
                        ))}
                    </select>
                    <button onClick={() => fetchAnalytics(selectedVehicle)} className="analytics-refresh-btn">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* TOP KPI CARDS */}
            <div className="analytics-summary-grid">
                <div className="summary-card blue">
                    <div className="summary-card-top">
                        <div className="summary-card-icon"><Truck size={20} /></div>
                        <span className="summary-card-label">Fleet</span>
                    </div>
                    <span className="summary-card-value">{totalVehicles} <small>vehicles</small></span>
                    <span className="summary-card-sub">{activeVehicles} active · {maintenanceVehicles} maintenance{inactiveVehicles > 0 ? ` · ${inactiveVehicles} inactive` : ''}</span>
                </div>
                <div className="summary-card green">
                    <div className="summary-card-top">
                        <div className="summary-card-icon"><IndianRupee size={20} /></div>
                        <span className="summary-card-label">Expenses (6m)</span>
                    </div>
                    <span className="summary-card-value">{fmt(totalExpense)}</span>
                    <span className="summary-card-sub">{pendingExpenseCount > 0 ? `${pendingExpenseCount} pending (${fmt(pendingExpenseTotal)})` : 'All approved'}</span>
                </div>
                <div className="summary-card purple">
                    <div className="summary-card-top">
                        <div className="summary-card-icon"><FileText size={20} /></div>
                        <span className="summary-card-label">Documents</span>
                    </div>
                    <span className="summary-card-value">{totalDocuments} <small>total</small></span>
                    <span className="summary-card-sub">
                        {expiredDocuments > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>{expiredDocuments} expired · </span>}
                        {expiringSoonDocuments > 0 && <span style={{ color: '#f59e0b', fontWeight: 600 }}>{expiringSoonDocuments} expiring soon</span>}
                        {expiredDocuments === 0 && expiringSoonDocuments === 0 && <span>All valid</span>}
                    </span>
                </div>
                <div className="summary-card amber">
                    <div className="summary-card-top">
                        <div className="summary-card-icon"><Users size={20} /></div>
                        <span className="summary-card-label">Drivers</span>
                    </div>
                    <span className="summary-card-value">{totalDrivers} <small>total</small></span>
                    <span className="summary-card-sub">{activeDrivers} active · {driversWithVehicles} assigned</span>
                </div>
            </div>

            {/* COMPLIANCE ROW - 3 ring cards */}
            <div className="analytics-compliance-row">
                <Card className="compliance-card">
                    <div className="compliance-card-inner">
                        <ProgressRing value={checklistComplianceToday} color={checklistComplianceToday >= 80 ? '#10b981' : checklistComplianceToday >= 50 ? '#f59e0b' : '#ef4444'} />
                        <div>
                            <div className="compliance-card-title">Daily Checklist</div>
                            <div className="compliance-card-sub">{todayChecklistsDone} done today</div>
                            <div className="compliance-card-detail">{totalChecklistsLast30} in last 30 days · {issuesReported} issues</div>
                        </div>
                    </div>
                </Card>
                <Card className="compliance-card">
                    <div className="compliance-card-inner">
                        <ProgressRing value={docCompliancePct} color={docCompliancePct >= 80 ? '#10b981' : docCompliancePct >= 50 ? '#f59e0b' : '#ef4444'} />
                        <div>
                            <div className="compliance-card-title">Document Compliance</div>
                            <div className="compliance-card-sub">{validDocuments} valid of {totalDocuments}</div>
                            <div className="compliance-card-detail">
                                {expiredDocuments > 0 ? <span style={{ color: '#ef4444' }}>{expiredDocuments} expired</span> : 'No expired docs'}
                            </div>
                        </div>
                    </div>
                </Card>
                <Card className="compliance-card">
                    <div className="compliance-card-inner">
                        <ProgressRing value={healthyPct} color={healthyPct >= 70 ? '#10b981' : healthyPct >= 40 ? '#f59e0b' : '#ef4444'} />
                        <div>
                            <div className="compliance-card-title">Engine Health</div>
                            <div className="compliance-card-sub">{healthSummary.healthy || 0} healthy of {totalVehicles}</div>
                            <div className="compliance-card-detail">
                                {healthSummary.atRisk > 0 && <span style={{ color: '#ef4444' }}>{healthSummary.atRisk} at risk · </span>}
                                {healthSummary.noPrediction > 0 && <span>{healthSummary.noPrediction} no data</span>}
                                {(!healthSummary.atRisk && !healthSummary.noPrediction) && 'All healthy'}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* EXPENSE DISTRIBUTION + EXPENSE BY VEHICLE */}
            <div className="analytics-two-col">
                <Card className="analytics-card">
                    <h3 className="analytics-card-title"><BarChart3 size={18} /> Expense Distribution</h3>
                    {expenseEntries.length > 0 ? (
                        <div className="donut-section">
                            <DonutChart entries={expenseEntries} total={totalExpense} />
                            <div className="donut-legend">
                                {expenseEntries.map(([type, amount]) => {
                                    const pct = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;
                                    const config = typeConfig[type] || typeConfig.Other;
                                    const Icon = config.icon;
                                    return (
                                        <div key={type} className="donut-legend-item">
                                            <div className="donut-legend-left">
                                                <div className="donut-legend-dot" style={{ background: config.color }} />
                                                <Icon size={14} style={{ color: config.color }} />
                                                <span>{type}</span>
                                            </div>
                                            <div className="donut-legend-right">
                                                <span className="donut-legend-amount">{fmt(amount)}</span>
                                                <span className="donut-legend-pct">{pct}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="analytics-no-data">No expense data available</div>
                    )}
                </Card>

                {/* Vehicle Cost Ranking */}
                <Card className="analytics-card">
                    <h3 className="analytics-card-title"><Truck size={18} /> Vehicle Expense Ranking</h3>
                    {vehicleCosts.length > 0 && vehicleCosts.some(v => v.totalCost > 0) ? (
                        <div className="vehicle-costs-list">
                            {vehicleCosts.filter(v => v.totalCost > 0).map((v, i) => {
                                const pct = maxVehicleCost > 0 ? (v.totalCost / maxVehicleCost) * 100 : 0;
                                const isHigh = pct > 75;
                                const isMed = pct > 40;
                                return (
                                    <div key={i} className="vehicle-cost-item">
                                        <div className="vehicle-cost-header">
                                            <div className="vehicle-cost-left">
                                                <span className={`vehicle-cost-rank ${isHigh ? 'high' : isMed ? 'med' : 'low'}`}>#{i + 1}</span>
                                                <div>
                                                    <div className="vehicle-cost-number">{v.vehicleNumber}</div>
                                                    <div className="vehicle-cost-model">{v.model} · {v.status}</div>
                                                </div>
                                            </div>
                                            <div className={`vehicle-cost-amount ${isHigh ? 'high' : isMed ? 'med' : 'low'}`}>{fmt(v.totalCost)}</div>
                                        </div>
                                        <div className="vehicle-cost-bar">
                                            <div className="vehicle-cost-bar-fill" style={{
                                                width: `${pct}%`,
                                                background: isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="analytics-no-data"><AlertTriangle size={20} /><span>No vehicle expenses recorded yet</span></div>
                    )}
                </Card>
            </div>

            {/* MONTHLY TREND (full width) */}
            <Card className="analytics-card" style={{ marginTop: '20px' }}>
                <h3 className="analytics-card-title">
                    <Calendar size={18} /> Monthly Expense Trend
                    {monthEntries.length > 0 && (
                        <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {trendUp ? <ArrowUpRight size={16} style={{ color: '#ef4444' }} /> : <ArrowDownRight size={16} style={{ color: '#10b981' }} />}
                            <span style={{ color: trendUp ? '#ef4444' : '#10b981' }}>{Math.abs(trendPct)}% vs last month</span>
                        </span>
                    )}
                </h3>
                {monthEntries.length > 0 ? (
                    <div className="monthly-chart">
                        <div className="monthly-bars">
                            {monthEntries.map(([month, amount], i) => {
                                const height = maxMonthly > 0 ? Math.max((amount / maxMonthly) * 160, 8) : 8;
                                const isLast = i === monthEntries.length - 1;
                                return (
                                    <div key={month} className={`monthly-bar-col ${isLast ? 'active' : ''}`}>
                                        <div className="monthly-bar-tooltip">{fmt(amount)}</div>
                                        <div className="monthly-bar" style={{ height: `${height}px` }} />
                                        <div className="monthly-bar-label">{month}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="analytics-no-data">No expense data yet. Approved expenses will appear here.</div>
                )}
            </Card>

            {/* BOTTOM ROW: Document breakdown + Fleet Status */}
            <div className="analytics-two-col" style={{ marginTop: '20px' }}>
                <Card className="analytics-card">
                    <h3 className="analytics-card-title"><FileText size={18} /> Document Overview</h3>
                    <div className="doc-status-grid">
                        <div className="doc-status-item valid">
                            <CheckCircle size={18} />
                            <div>
                                <div className="doc-status-count">{validDocuments}</div>
                                <div className="doc-status-label">Valid</div>
                            </div>
                        </div>
                        <div className="doc-status-item warning">
                            <Clock size={18} />
                            <div>
                                <div className="doc-status-count">{expiringSoonDocuments}</div>
                                <div className="doc-status-label">Expiring Soon</div>
                            </div>
                        </div>
                        <div className="doc-status-item danger">
                            <XCircle size={18} />
                            <div>
                                <div className="doc-status-count">{expiredDocuments}</div>
                                <div className="doc-status-label">Expired</div>
                            </div>
                        </div>
                    </div>
                    {Object.keys(docsByType).length > 0 && (
                        <div className="doc-type-list">
                            {Object.entries(docsByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                                <div key={type} className="doc-type-item">
                                    <span className="doc-type-name">{type}</span>
                                    <span className="doc-type-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="analytics-card">
                    <h3 className="analytics-card-title"><Activity size={18} /> Fleet Status Overview</h3>
                    <div className="fleet-status-grid">
                        <div className="fleet-status-item">
                            <div className="fleet-status-dot" style={{ background: '#10b981' }} />
                            <span>Active Vehicles</span>
                            <strong>{activeVehicles}</strong>
                        </div>
                        <div className="fleet-status-item">
                            <div className="fleet-status-dot" style={{ background: '#f59e0b' }} />
                            <span>In Maintenance</span>
                            <strong>{maintenanceVehicles}</strong>
                        </div>
                        <div className="fleet-status-item">
                            <div className="fleet-status-dot" style={{ background: '#ef4444' }} />
                            <span>Inactive</span>
                            <strong>{inactiveVehicles}</strong>
                        </div>
                        <div className="fleet-status-item">
                            <div className="fleet-status-dot" style={{ background: '#8b5cf6' }} />
                            <span>Unassigned Vehicles</span>
                            <strong>{unassignedVehicles}</strong>
                        </div>
                    </div>
                    <div className="fleet-quick-stats">
                        <div className="fleet-quick-stat">
                            <span className="fleet-quick-stat-label">Avg Expense / Vehicle</span>
                            <span className="fleet-quick-stat-value">{fmt(avgPerVehicle)}</span>
                        </div>
                        <div className="fleet-quick-stat">
                            <span className="fleet-quick-stat-label">Assigned Drivers</span>
                            <span className="fleet-quick-stat-value">{driversWithVehicles} / {totalDrivers}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default FleetAnalytics;
