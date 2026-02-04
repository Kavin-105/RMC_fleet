import { useState, useEffect } from 'react';
import { Plus, Search, Truck, Edit2, Trash2, Eye, UserCog, Loader2, FileText, DollarSign, ClipboardCheck, Calendar, CheckCircle, XCircle } from 'lucide-react';
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
    Modal,
    Input,
    Select
} from '../../components/ui';
import { vehicleService, driverService } from '../../services';
import './Vehicles.css';

export function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [selectedVehicleForDriver, setSelectedVehicleForDriver] = useState(null);
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [vehicleDetails, setVehicleDetails] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState('overview');
    const [formData, setFormData] = useState({
        vehicleNumber: '',
        chassisNumber: '',
        model: '',
        manufacturingYear: new Date().getFullYear(),
        drumCapacity: '',
        registrationDate: '',
        currentOdometer: '',
        engineHours: '',
        assignedDriver: '',
        status: 'Active'
    });

    // Fetch vehicles and drivers on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vehiclesRes, driversRes] = await Promise.all([
                vehicleService.getAll(),
                driverService.getAll()
            ]);
            setVehicles(vehiclesRes.data || []);
            setDrivers(driversRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data. Using demo mode.');
            // Fallback to empty arrays
            setVehicles([]);
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter vehicles
    const filteredVehicles = vehicles.filter(vehicle => {
        const matchesSearch = vehicle.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || vehicle.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData({
                vehicleNumber: vehicle.vehicleNumber,
                chassisNumber: vehicle.chassisNumber,
                model: vehicle.model,
                manufacturingYear: vehicle.manufacturingYear,
                drumCapacity: vehicle.drumCapacity,
                registrationDate: vehicle.registrationDate ? vehicle.registrationDate.split('T')[0] : '',
                currentOdometer: vehicle.currentOdometer,
                engineHours: vehicle.engineHours,
                assignedDriver: vehicle.assignedDriver?._id || vehicle.assignedDriver || '',
                status: vehicle.status
            });
        } else {
            setEditingVehicle(null);
            setFormData({
                vehicleNumber: '',
                chassisNumber: '',
                model: '',
                manufacturingYear: new Date().getFullYear(),
                drumCapacity: '',
                registrationDate: '',
                currentOdometer: '',
                engineHours: '',
                assignedDriver: '',
                status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Clean the data - convert empty driver to null
            const cleanedData = {
                ...formData,
                assignedDriver: formData.assignedDriver || null
            };

            if (editingVehicle) {
                await vehicleService.update(editingVehicle._id, cleanedData);
                toast.success('Vehicle updated successfully!');
            } else {
                await vehicleService.create(cleanedData);
                toast.success('Vehicle added successfully!');
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error saving vehicle:', error);
            toast.error(error.response?.data?.message || 'Failed to save vehicle');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (vehicleId) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            await vehicleService.delete(vehicleId);
            toast.success('Vehicle deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            toast.error('Failed to delete vehicle');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // View Vehicle Details Modal handler
    const handleViewDetails = async (vehicle) => {
        setDetailLoading(true);
        setIsDetailModalOpen(true);
        setActiveDetailTab('overview');
        try {
            const response = await vehicleService.getDetails(vehicle._id);
            setVehicleDetails(response.data);
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            toast.error('Failed to load vehicle details');
            setIsDetailModalOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setVehicleDetails(null);
    };

    // Change Driver Modal handlers
    const handleOpenDriverModal = (vehicle) => {
        setSelectedVehicleForDriver(vehicle);
        setSelectedDriverId(vehicle.assignedDriver?._id || vehicle.assignedDriver || '');
        setIsDriverModalOpen(true);
    };

    const handleCloseDriverModal = () => {
        setIsDriverModalOpen(false);
        setSelectedVehicleForDriver(null);
        setSelectedDriverId('');
    };

    const handleChangeDriver = async () => {
        setSaving(true);
        try {
            await vehicleService.assignDriver(selectedVehicleForDriver._id, selectedDriverId || null);
            toast.success('Driver assigned successfully!');
            handleCloseDriverModal();
            fetchData();
        } catch (error) {
            console.error('Error assigning driver:', error);
            const errorMessage = error.response?.data?.message || 'Failed to assign driver';
            toast.error(errorMessage);

            // If there's a conflict vehicle, show additional info
            if (error.response?.data?.conflictVehicle) {
                toast.error(`Remove driver from ${error.response.data.conflictVehicle} first`, { duration: 5000 });
            }
        } finally {
            setSaving(false);
        }
    };

    const driverOptions = drivers
        .filter(d => d.status === 'Active')
        .map(d => ({ value: d._id, label: d.name }));

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Maintenance', label: 'Maintenance' }
    ];

    const modelOptions = [
        { value: 'Schwing Stetter AM 6', label: 'Schwing Stetter AM 6 (6m³)' },
        { value: 'Schwing Stetter AM 7', label: 'Schwing Stetter AM 7 (7m³)' },
        { value: 'Schwing Stetter AM 9', label: 'Schwing Stetter AM 9 (9m³)' },
        { value: 'Schwing Stetter AM 12', label: 'Schwing Stetter AM 12 (12m³)' },
        { value: 'Ajax Fiori ARGO 2000', label: 'Ajax Fiori ARGO 2000 (4m³)' },
        { value: 'Ajax Fiori ARGO 4000', label: 'Ajax Fiori ARGO 4000 (6m³)' }
    ];

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
                    <h1 className="page-title">Vehicles</h1>
                    <p className="page-subtitle">Manage your transit mixer fleet ({vehicles.length} vehicles)</p>
                </div>
                <Button icon={Plus} onClick={() => handleOpenModal()}>
                    Add Vehicle
                </Button>
            </div>

            {/* Filters */}
            <div className="page-filters" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="filter-search">
                    <Search size={18} className="filter-search-icon" />
                    <input
                        type="text"
                        placeholder="Search vehicles..."
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
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                </select>
            </div>

            {/* Vehicles Table */}
            <Card>
                <CardBody style={{ padding: 0 }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Assigned Driver</TableHead>
                                <TableHead>Odometer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVehicles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                        No vehicles found. Add your first vehicle!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredVehicles.map((vehicle) => {
                                    const driver = vehicle.assignedDriver;
                                    return (
                                        <TableRow
                                            key={vehicle._id}
                                            onClick={() => handleViewDetails(vehicle)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>
                                                <div className="vehicle-info">
                                                    <div className="vehicle-icon">
                                                        <Truck size={20} />
                                                    </div>
                                                    <div className="vehicle-details">
                                                        <h4>{vehicle.vehicleNumber}</h4>
                                                        <span className="vehicle-model">{vehicle.model}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{vehicle.drumCapacity} m³</TableCell>
                                            <TableCell>
                                                {driver ? (
                                                    <div className="driver-info">
                                                        <div className="driver-avatar">
                                                            {(driver.name || driver).charAt(0)}
                                                        </div>
                                                        <span className="driver-name">{driver.name || driver}</span>
                                                    </div>
                                                ) : (
                                                    <span className="no-driver">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{vehicle.currentOdometer?.toLocaleString() || 0} km</TableCell>
                                            <TableCell>
                                                <Badge variant={vehicle.status === 'Active' ? 'active' : 'maintenance'}>
                                                    {vehicle.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        className="action-btn"
                                                        title="View Details"
                                                        onClick={() => handleViewDetails(vehicle)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn assign"
                                                        title="Change Driver"
                                                        onClick={() => handleOpenDriverModal(vehicle)}
                                                    >
                                                        <UserCog size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn edit"
                                                        title="Edit"
                                                        onClick={() => handleOpenModal(vehicle)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        title="Delete"
                                                        onClick={() => handleDelete(vehicle._id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Add/Edit Vehicle Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Saving...' : editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <Input
                            label="Vehicle Number"
                            name="vehicleNumber"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            placeholder="MH-12-XX-1234"
                            required
                        />
                        <Input
                            label="Chassis Number"
                            name="chassisNumber"
                            value={formData.chassisNumber}
                            onChange={handleChange}
                            placeholder="TCM202312345"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <Select
                            label="Model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            options={modelOptions}
                            required
                        />
                        <Input
                            label="Manufacturing Year"
                            name="manufacturingYear"
                            type="number"
                            value={formData.manufacturingYear}
                            onChange={handleChange}
                            min="2000"
                            max={new Date().getFullYear()}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <Input
                            label="Drum Capacity (m³)"
                            name="drumCapacity"
                            type="number"
                            value={formData.drumCapacity}
                            onChange={handleChange}
                            placeholder="6"
                            required
                        />
                        <Input
                            label="Registration Date"
                            name="registrationDate"
                            type="date"
                            value={formData.registrationDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <Input
                            label="Current Odometer (km)"
                            name="currentOdometer"
                            type="number"
                            value={formData.currentOdometer}
                            onChange={handleChange}
                            placeholder="0"
                        />
                        <Input
                            label="Engine Hours"
                            name="engineHours"
                            type="number"
                            value={formData.engineHours}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div className="form-row">
                        <Select
                            label="Assigned Driver"
                            name="assignedDriver"
                            value={formData.assignedDriver}
                            onChange={handleChange}
                            options={driverOptions}
                            placeholder="Select a driver"
                        />
                        <Select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            options={statusOptions}
                            required
                        />
                    </div>
                </form>
            </Modal>

            {/* Change Driver Modal */}
            <Modal
                isOpen={isDriverModalOpen}
                onClose={handleCloseDriverModal}
                title="Change Driver"
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseDriverModal}>Cancel</Button>
                        <Button onClick={handleChangeDriver} disabled={saving}>
                            {saving ? 'Saving...' : 'Assign Driver'}
                        </Button>
                    </>
                }
            >
                {selectedVehicleForDriver && (
                    <div>
                        <div className="change-driver-vehicle">
                            <div className="vehicle-icon">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h4>{selectedVehicleForDriver.vehicleNumber}</h4>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--grey-500)' }}>
                                    {selectedVehicleForDriver.model}
                                </p>
                            </div>
                        </div>

                        <Select
                            label="Select Driver"
                            value={selectedDriverId}
                            onChange={(e) => setSelectedDriverId(e.target.value)}
                            options={[
                                { value: '', label: 'Unassign Driver' },
                                ...driverOptions
                            ]}
                            placeholder="Choose a driver"
                        />

                        {selectedDriverId && (
                            <div className="selected-driver-preview">
                                <div className="driver-avatar">
                                    {driverOptions.find(d => d.value === selectedDriverId)?.label?.charAt(0) || '?'}
                                </div>
                                <span>{driverOptions.find(d => d.value === selectedDriverId)?.label}</span>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Vehicle Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                title={vehicleDetails?.vehicle?.vehicleNumber || 'Vehicle Details'}
                size="lg"
            >
                {detailLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
                        <Loader2 size={32} className="spin" />
                    </div>
                ) : vehicleDetails && (
                    <div className="vehicle-detail-content">
                        {/* Tabs */}
                        <div className="vehicle-detail-tabs">
                            <button
                                className={`detail-tab ${activeDetailTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveDetailTab('overview')}
                            >
                                <Truck size={16} /> Overview
                            </button>
                            <button
                                className={`detail-tab ${activeDetailTab === 'expenses' ? 'active' : ''}`}
                                onClick={() => setActiveDetailTab('expenses')}
                            >
                                <DollarSign size={16} /> Expenses ({vehicleDetails.expenses?.length || 0})
                            </button>
                            <button
                                className={`detail-tab ${activeDetailTab === 'documents' ? 'active' : ''}`}
                                onClick={() => setActiveDetailTab('documents')}
                            >
                                <FileText size={16} /> Documents ({vehicleDetails.documents?.length || 0})
                            </button>
                            <button
                                className={`detail-tab ${activeDetailTab === 'checklists' ? 'active' : ''}`}
                                onClick={() => setActiveDetailTab('checklists')}
                            >
                                <ClipboardCheck size={16} /> Checklists
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="vehicle-detail-tab-content">
                            {/* Overview Tab */}
                            {activeDetailTab === 'overview' && (
                                <div className="detail-overview">
                                    <div className="detail-info-grid">
                                        <div className="detail-info-item">
                                            <span className="detail-label">Model</span>
                                            <span className="detail-value">{vehicleDetails.vehicle?.model}</span>
                                        </div>
                                        <div className="detail-info-item">
                                            <span className="detail-label">Year</span>
                                            <span className="detail-value">{vehicleDetails.vehicle?.manufacturingYear}</span>
                                        </div>
                                        <div className="detail-info-item">
                                            <span className="detail-label">Drum Capacity</span>
                                            <span className="detail-value">{vehicleDetails.vehicle?.drumCapacity} m³</span>
                                        </div>
                                        <div className="detail-info-item">
                                            <span className="detail-label">Status</span>
                                            <Badge variant={vehicleDetails.vehicle?.status === 'Active' ? 'success' : 'warning'}>
                                                {vehicleDetails.vehicle?.status}
                                            </Badge>
                                        </div>
                                        <div className="detail-info-item">
                                            <span className="detail-label">Odometer</span>
                                            <span className="detail-value">{vehicleDetails.vehicle?.currentOdometer?.toLocaleString()} km</span>
                                        </div>
                                        <div className="detail-info-item">
                                            <span className="detail-label">Assigned Driver</span>
                                            <span className="detail-value">{vehicleDetails.vehicle?.assignedDriver?.name || 'Not Assigned'}</span>
                                        </div>
                                    </div>
                                    <div className="detail-checklist-status">
                                        <h4>Today's Checklist Status</h4>
                                        {vehicleDetails.todayChecklistCompleted ? (
                                            <div className="checklist-complete-badge">
                                                <CheckCircle size={20} /> Completed
                                            </div>
                                        ) : (
                                            <div className="checklist-pending-badge">
                                                <XCircle size={20} /> Not Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Expenses Tab */}
                            {activeDetailTab === 'expenses' && (
                                <div className="detail-expenses">
                                    {vehicleDetails.expenses?.length === 0 ? (
                                        <p className="empty-state">No expenses recorded for this vehicle.</p>
                                    ) : (
                                        <div className="detail-list">
                                            {vehicleDetails.expenses?.map((expense) => (
                                                <div key={expense._id} className="detail-list-item">
                                                    <div className="detail-list-info">
                                                        <strong>{expense.type}</strong>
                                                        <span>{expense.driver?.name} • {new Date(expense.date).toLocaleDateString('en-IN')}</span>
                                                    </div>
                                                    <div className="detail-list-right">
                                                        <span className="amount">₹{expense.amount?.toLocaleString()}</span>
                                                        <Badge variant={expense.status?.toLowerCase()}>{expense.status}</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeDetailTab === 'documents' && (
                                <div className="detail-documents">
                                    {vehicleDetails.documents?.length === 0 ? (
                                        <p className="empty-state">No documents found for this vehicle.</p>
                                    ) : (
                                        <div className="detail-list">
                                            {vehicleDetails.documents?.map((doc) => {
                                                const daysUntil = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                                const status = daysUntil < 0 ? 'expired' : daysUntil <= 30 ? 'expiring' : 'valid';
                                                return (
                                                    <div key={doc._id} className="detail-list-item">
                                                        <div className="detail-list-info">
                                                            <strong>{doc.type}</strong>
                                                            <span>Expires: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}</span>
                                                        </div>
                                                        <Badge variant={status}>
                                                            {daysUntil < 0 ? 'Expired' : daysUntil <= 30 ? `${daysUntil} days` : 'Valid'}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Checklists Tab */}
                            {activeDetailTab === 'checklists' && (
                                <div className="detail-checklists">
                                    {vehicleDetails.checklists?.length === 0 ? (
                                        <p className="empty-state">No checklists in the last 7 days.</p>
                                    ) : (
                                        <div className="detail-list">
                                            {vehicleDetails.checklists?.map((checklist) => (
                                                <div key={checklist._id} className="detail-list-item">
                                                    <div className="detail-list-info">
                                                        <strong>{new Date(checklist.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                                                        <span>{checklist.driver?.name}</span>
                                                    </div>
                                                    <Badge variant={checklist.allChecked ? 'success' : 'warning'}>
                                                        {checklist.allChecked ? 'Complete' : 'Partial'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Vehicles;
