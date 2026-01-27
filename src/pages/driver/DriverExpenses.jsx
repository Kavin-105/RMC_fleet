import { useState, useEffect } from 'react';
import { Camera, Fuel, Wrench, CircleDollarSign, Package, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Input, Badge, Textarea } from '../../components/ui';
import { expenseService } from '../../services';
import { authService } from '../../services';
import './DriverExpenses.css';

const expenseTypes = [
    { value: 'Fuel', label: 'Fuel', icon: Fuel },
    { value: 'Maintenance', label: 'Repair', icon: Wrench },
    { value: 'Toll', label: 'Toll', icon: CircleDollarSign },
    { value: 'Spare Parts', label: 'Parts', icon: Package },
    { value: 'Other', label: 'Other', icon: CircleDollarSign }
];

export function DriverExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        amount: '',
        description: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await expenseService.getAll();
            setExpenses(response.data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Failed to load expenses');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.type || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            // Get driver and vehicle info
            const driver = authService.getCurrentDriver();
            const user = authService.getCurrentUser();

            const expenseData = {
                ...formData,
                amount: parseFloat(formData.amount),
                vehicle: driver?.assignedVehicles?.[0]?._id || driver?.assignedVehicles?.[0],
                driver: driver?._id,
                date: new Date()
            };

            await expenseService.create(expenseData);
            toast.success('Expense submitted successfully!');

            setFormData({ type: '', amount: '', description: '' });
            setShowForm(false);
            fetchExpenses();
        } catch (error) {
            console.error('Error submitting expense:', error);
            toast.error(error.response?.data?.message || 'Failed to submit expense');
        } finally {
            setSaving(false);
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
            <div className="driver-page-header">
                <h1 className="driver-page-title">Expenses</h1>
                <p className="driver-page-subtitle">Submit and track your expenses</p>
            </div>

            {/* Add Expense Form Toggle */}
            {!showForm ? (
                <Button fullWidth onClick={() => setShowForm(true)} style={{ marginBottom: 'var(--space-4)' }}>
                    + Add New Expense
                </Button>
            ) : (
                <Card className="expense-form-card">
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>New Expense</h3>

                    {/* Expense Type Selection */}
                    <div className="expense-type-selector">
                        {expenseTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    className={`expense-type-option ${formData.type === type.value ? 'selected' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                >
                                    <Icon size={20} />
                                    <span>{type.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Amount Input */}
                    <div className="amount-input-container">
                        <span className="currency-symbol">₹</span>
                        <input
                            type="number"
                            className="amount-input"
                            placeholder="0"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        />
                    </div>

                    {/* Description */}
                    <Textarea
                        placeholder="Add a description (optional)"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                    />

                    {/* Photo Upload */}
                    <button className="photo-upload-btn">
                        <Camera size={20} />
                        <span>Add Bill Photo</span>
                    </button>

                    {/* Actions */}
                    <div className="expense-form-actions">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Submitting...' : 'Submit Expense'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Expense History */}
            <div className="expense-history">
                <h3>Expense History</h3>

                {expenses.length === 0 ? (
                    <Card>
                        <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--grey-500)' }}>
                            No expenses yet. Add your first expense!
                        </p>
                    </Card>
                ) : (
                    <div className="expense-history-list">
                        {expenses.map((expense) => {
                            const TypeIcon = expenseTypes.find(t => t.value === expense.type)?.icon || CircleDollarSign;

                            return (
                                <Card key={expense._id} className="expense-history-item">
                                    <div className="expense-history-icon">
                                        <TypeIcon size={20} />
                                    </div>
                                    <div className="expense-history-info">
                                        <h4>{expense.type}</h4>
                                        <p>
                                            {new Date(expense.date || expense.createdAt).toLocaleDateString('en-IN')}
                                            {expense.description && ` • ${expense.description}`}
                                        </p>
                                    </div>
                                    <div className="expense-history-right">
                                        <span className="expense-history-amount">₹{expense.amount?.toLocaleString()}</span>
                                        <Badge variant={expense.status?.toLowerCase()}>{expense.status}</Badge>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DriverExpenses;
