import { useState, useEffect } from 'react';
import { CheckCircle, Circle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button } from '../../components/ui';
import { checklistService } from '../../services';
import { authService } from '../../services';
import './DailyChecklist.css';

const checklistItems = [
    { id: 'engineOilLevel', label: 'Engine Oil Level', description: 'Check dipstick for adequate oil level' },
    { id: 'brakeCheck', label: 'Brake System', description: 'Test brake pedal response and pressure' },
    { id: 'tyreCondition', label: 'Tyre Condition', description: 'Check tyre pressure and tread wear' },
    { id: 'drumRotation', label: 'Drum Rotation', description: 'Verify drum rotates smoothly in both directions' },
    { id: 'waterSystem', label: 'Water System', description: 'Check water tank level and spray nozzles' },
    { id: 'lightsHorn', label: 'Lights & Horn', description: 'Test all lights and horn functionality' }
];

export function DailyChecklist() {
    const [checkedItems, setCheckedItems] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [existingChecklist, setExistingChecklist] = useState(null);

    useEffect(() => {
        fetchTodayChecklist();
    }, []);

    const fetchTodayChecklist = async () => {
        setLoading(true);
        try {
            const driver = authService.getCurrentDriver();

            if (driver?.assignedVehicles?.[0]) {
                const vehicleId = driver.assignedVehicles[0]._id || driver.assignedVehicles[0];
                const response = await checklistService.getToday(vehicleId, driver._id);

                if (response.data) {
                    setExistingChecklist(response.data);
                    setCheckedItems(response.data.items || {});
                    setIsCompleted(true); // If checklist exists, it's already completed
                }
            }
        } catch (error) {
            console.error('Error fetching checklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (itemId) => {
        if (isCompleted) return;

        setCheckedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const completedCount = Object.values(checkedItems).filter(Boolean).length;
    const progress = (completedCount / checklistItems.length) * 100;
    const allChecked = completedCount === checklistItems.length;

    const handleSubmit = async () => {
        if (!allChecked) {
            toast.error('Please complete all checklist items');
            return;
        }

        setSaving(true);
        try {
            const driver = authService.getCurrentDriver();
            const vehicleId = driver?.assignedVehicles?.[0]?._id || driver?.assignedVehicles?.[0];

            const checklistData = {
                vehicle: vehicleId,
                driver: driver?._id,
                items: checkedItems
            };

            const response = await checklistService.create(checklistData);
            setExistingChecklist(response.data);
            toast.success('Checklist submitted successfully!');
            setIsCompleted(true);
        } catch (error) {
            console.error('Error submitting checklist:', error);

            // Check if already completed
            if (error.response?.data?.alreadyCompleted) {
                setIsCompleted(true);
                setExistingChecklist(error.response.data.existingChecklist);
                toast.error(error.response.data.message);
            } else {
                toast.error(error.response?.data?.message || 'Failed to submit checklist');
            }
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

    if (isCompleted && existingChecklist) {
        const submittedDate = new Date(existingChecklist.submittedAt);
        const nextAvailable = new Date();
        nextAvailable.setDate(nextAvailable.getDate() + 1);
        nextAvailable.setHours(0, 0, 0, 0);

        return (
            <div className="checklist-complete-screen">
                <div className="checklist-complete-icon">
                    <CheckCircle size={64} />
                </div>
                <h2>Checklist Completed!</h2>
                <p>Your vehicle is ready for today's trips.</p>
                <p className="checklist-complete-time">
                    Submitted at {submittedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="checklist-next-available">
                    <p>You can fill the next checklist on:</p>
                    <p className="next-date">
                        {nextAvailable.toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Show completed items */}
                <div className="completed-checklist-items">
                    <h3>Completed Items:</h3>
                    <div className="completed-items-list">
                        {checklistItems.map((item) => (
                            <div key={item.id} className="completed-item">
                                <CheckCircle size={18} className="completed-check" />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Check if driver has an assigned vehicle
    const driver = authService.getCurrentDriver();
    const hasVehicle = driver?.assignedVehicles?.length > 0;

    if (!hasVehicle) {
        return (
            <div className="checklist-no-vehicle-screen">
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    <AlertTriangle size={64} style={{ color: 'var(--yellow-500)', marginBottom: 'var(--space-4)' }} />
                    <h2 style={{ margin: '0 0 var(--space-2) 0', color: 'var(--yellow-700)' }}>No Vehicle Assigned</h2>
                    <p style={{ color: 'var(--grey-600)', marginBottom: 'var(--space-4)' }}>
                        You cannot complete the daily checklist without an assigned vehicle.
                    </p>
                    <p style={{ color: 'var(--grey-500)', fontSize: 'var(--font-size-sm)' }}>
                        Please contact your fleet manager to assign a vehicle.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="driver-page-header">
                <h1 className="driver-page-title">Daily Checklist</h1>
                <p className="driver-page-subtitle">Complete all checks before starting your trip</p>
            </div>

            {/* Progress Bar */}
            <Card className="checklist-progress-card">
                <div className="checklist-progress-header">
                    <span>Progress</span>
                    <span>{completedCount}/{checklistItems.length} completed</span>
                </div>
                <div className="checklist-progress-bar">
                    <div
                        className="checklist-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </Card>

            {/* Warning */}
            {completedCount === 0 && (
                <div className="checklist-warning">
                    <AlertTriangle size={18} />
                    <span>This checklist is mandatory before starting your trip</span>
                </div>
            )}

            {/* Checklist Items */}
            <div className="checklist-items">
                {checklistItems.map((item) => (
                    <Card
                        key={item.id}
                        className={`checklist-item ${checkedItems[item.id] ? 'checked' : ''}`}
                        onClick={() => handleToggle(item.id)}
                    >
                        <div className="checklist-item-check">
                            {checkedItems[item.id] ? (
                                <CheckCircle size={24} className="check-icon checked" />
                            ) : (
                                <Circle size={24} className="check-icon" />
                            )}
                        </div>
                        <div className="checklist-item-content">
                            <h4>{item.label}</h4>
                            <p>{item.description}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Submit Button */}
            <Button
                fullWidth
                size="lg"
                onClick={handleSubmit}
                disabled={!allChecked || saving}
                style={{ marginTop: 'var(--space-4)' }}
            >
                {saving ? 'Submitting...' : allChecked ? 'Submit Checklist' : `Complete ${checklistItems.length - completedCount} more items`}
            </Button>
        </div>
    );
}

export default DailyChecklist;
