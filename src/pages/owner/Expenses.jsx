import { useState, useEffect } from 'react';
import { Search, Check, X, Fuel, Wrench, CircleDollarSign, Package, Loader2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    Button,
    Card,
    CardBody,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Badge,
    StatsCard
} from '../../components/ui';
import { expenseService } from '../../services';
import './Expenses.css';

const expenseIcons = {
    'Fuel': Fuel,
    'Maintenance': Wrench,
    'Toll': CircleDollarSign,
    'Spare Parts': Package,
    'Other': CircleDollarSign
};

export function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({
        totalApproved: 0,
        pendingAmount: 0,
        pendingCount: 0,
        byType: {}
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [expensesRes, summaryRes] = await Promise.all([
                expenseService.getAll(),
                expenseService.getSummary()
            ]);
            setExpenses(expensesRes.data || []);
            setSummary(summaryRes.data || {
                totalApproved: 0,
                pendingAmount: 0,
                pendingCount: 0,
                byType: {}
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load expenses');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter expenses
    const filteredExpenses = expenses.filter(expense => {
        const vehicleNumber = expense.vehicle?.vehicleNumber || '';
        const driverName = expense.driver?.name || '';
        const matchesSearch = vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driverName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || expense.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleApprove = async (expenseId) => {
        setActionLoading(expenseId);
        try {
            await expenseService.approve(expenseId);
            toast.success('Expense approved!');
            fetchData();
        } catch (error) {
            console.error('Error approving expense:', error);
            toast.error('Failed to approve expense');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (expenseId) => {
        const reason = window.prompt('Enter rejection reason (optional):');

        setActionLoading(expenseId);
        try {
            await expenseService.reject(expenseId, reason);
            toast.success('Expense rejected!');
            fetchData();
        } catch (error) {
            console.error('Error rejecting expense:', error);
            toast.error('Failed to reject expense');
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewBill = async (expense) => {
        if (!expense.billPhoto) {
            toast.error('No bill photo attached');
            return;
        }
        try {
            toast.loading('Loading bill...', { id: 'bill-loading' });
            const response = await expenseService.getBillPhoto(expense._id);
            const blob = new Blob([response], { type: expense.billPhotoContentType || 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.dismiss('bill-loading');
        } catch (error) {
            console.error('Error loading bill:', error);
            toast.dismiss('bill-loading');
            toast.error('Failed to load bill photo');
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
            {/* Page Header */}
            <div className="page-header-actions">
                <div className="page-header-left">
                    <h1 className="page-title">Expenses</h1>
                    <p className="page-subtitle">Review and approve driver expenses</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="expense-summary-grid">
                <StatsCard
                    title="Total Approved"
                    value={`₹${summary.totalApproved?.toLocaleString() || 0}`}
                    variant="success"
                />
                <StatsCard
                    title="Pending Approval"
                    value={`₹${summary.pendingAmount?.toLocaleString() || 0}`}
                    subtitle={`${summary.pendingCount || 0} expenses`}
                    variant="warning"
                />
                <StatsCard
                    title="Fuel Expenses"
                    value={`₹${summary.byType?.Fuel?.toLocaleString() || 0}`}
                    variant="primary"
                />
                <StatsCard
                    title="Maintenance"
                    value={`₹${summary.byType?.Maintenance?.toLocaleString() || 0}`}
                    variant="secondary"
                />
            </div>

            {/* Filters */}
            <div className="page-filters" style={{ marginBottom: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <div className="filter-search">
                    <Search size={18} className="filter-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by vehicle or driver..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {/* Expenses Table */}
            <Card>
                <CardBody style={{ padding: 0 }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Bill</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                        No expenses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredExpenses.map((expense) => {
                                    const Icon = expenseIcons[expense.type] || CircleDollarSign;

                                    return (
                                        <TableRow key={expense._id}>
                                            <TableCell>
                                                <div className="expense-type-cell">
                                                    <div className={`expense-type-icon ${expense.type?.toLowerCase().replace(' ', '-')}`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <span>{expense.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{expense.vehicle?.vehicleNumber || 'N/A'}</TableCell>
                                            <TableCell>{expense.driver?.name || 'N/A'}</TableCell>
                                            <TableCell className="expense-amount">
                                                ₹{expense.amount?.toLocaleString() || 0}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(expense.date || expense.createdAt).toLocaleDateString('en-IN')}
                                            </TableCell>
                                            <TableCell>
                                                {expense.billPhoto ? (
                                                    <button
                                                        className="expense-action-btn view"
                                                        onClick={() => handleViewBill(expense)}
                                                    >
                                                        <Eye size={14} /> View
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--grey-400)' }}>-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={expense.status?.toLowerCase()}>
                                                    {expense.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {expense.status === 'Pending' ? (
                                                    <div className="expense-actions">
                                                        <button
                                                            className="expense-action-btn approve"
                                                            onClick={() => handleApprove(expense._id)}
                                                            disabled={actionLoading === expense._id}
                                                        >
                                                            {actionLoading === expense._id ? (
                                                                <Loader2 size={14} className="spin" />
                                                            ) : (
                                                                <Check size={14} />
                                                            )}
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="expense-action-btn reject"
                                                            onClick={() => handleReject(expense._id)}
                                                            disabled={actionLoading === expense._id}
                                                        >
                                                            <X size={14} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="expense-status-text">
                                                        {expense.status === 'Approved' ? '✓ Approved' : '✕ Rejected'}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}

export default Expenses;
