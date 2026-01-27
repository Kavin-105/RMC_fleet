import { useState, useEffect } from 'react';
import { Plus, Search, User, Edit2, Trash2, Phone, FileText, Loader2 } from 'lucide-react';
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
    Input
} from '../../components/ui';
import { driverService } from '../../services';
import './Drivers.css';

export function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        licenseNumber: '',
        licenseExpiry: '',
        status: 'Active',
        password: ''
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const response = await driverService.getAll();
            setDrivers(response.data || []);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            toast.error('Failed to load drivers');
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter drivers
    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.mobile?.includes(searchTerm);
        const matchesStatus = !statusFilter || driver.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleOpenModal = (driver = null) => {
        if (driver) {
            setEditingDriver(driver);
            setFormData({
                name: driver.name,
                mobile: driver.mobile,
                licenseNumber: driver.licenseNumber,
                licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split('T')[0] : '',
                status: driver.status,
                password: ''
            });
        } else {
            setEditingDriver(null);
            setFormData({
                name: '',
                mobile: '',
                licenseNumber: '',
                licenseExpiry: '',
                status: 'Active',
                password: 'driver123'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDriver(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingDriver) {
                await driverService.update(editingDriver._id, formData);
                toast.success('Driver updated successfully!');
            } else {
                await driverService.create(formData);
                toast.success('Driver added successfully!');
            }
            handleCloseModal();
            fetchDrivers();
        } catch (error) {
            console.error('Error saving driver:', error);
            toast.error(error.response?.data?.message || 'Failed to save driver');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (driverId) => {
        if (!window.confirm('Are you sure you want to delete this driver?')) return;

        try {
            await driverService.delete(driverId);
            toast.success('Driver deleted successfully!');
            fetchDrivers();
        } catch (error) {
            console.error('Error deleting driver:', error);
            toast.error('Failed to delete driver');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Calculate days until license expiry
    const getDaysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getLicenseStatus = (expiryDate) => {
        const days = getDaysUntilExpiry(expiryDate);
        if (days < 0) return 'expired';
        if (days <= 30) return 'expiring';
        return 'valid';
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
                    <h1 className="page-title">Drivers</h1>
                    <p className="page-subtitle">Manage your drivers ({drivers.length} drivers)</p>
                </div>
                <Button icon={Plus} onClick={() => handleOpenModal()}>
                    Add Driver
                </Button>
            </div>

            {/* Filters */}
            <div className="page-filters" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="filter-search">
                    <Search size={18} className="filter-search-icon" />
                    <input
                        type="text"
                        placeholder="Search drivers..."
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
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Drivers Table */}
            <Card>
                <CardBody style={{ padding: 0 }}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Driver</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead>License</TableHead>
                                <TableHead>License Expiry</TableHead>
                                <TableHead>Compliance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDrivers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                        No drivers found. Add your first driver!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDrivers.map((driver) => {
                                    const licenseStatus = getLicenseStatus(driver.licenseExpiry);
                                    const daysUntilExpiry = getDaysUntilExpiry(driver.licenseExpiry);

                                    return (
                                        <TableRow key={driver._id}>
                                            <TableCell>
                                                <div className="driver-row-info">
                                                    <div className="driver-row-avatar">
                                                        {driver.name?.charAt(0) || 'D'}
                                                    </div>
                                                    <span className="driver-row-name">{driver.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="driver-mobile">
                                                    <Phone size={14} />
                                                    {driver.mobile}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="driver-license">
                                                    <FileText size={14} />
                                                    {driver.licenseNumber}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`license-expiry ${licenseStatus}`}>
                                                    {new Date(driver.licenseExpiry).toLocaleDateString('en-IN')}
                                                    {licenseStatus === 'expiring' && ` (${daysUntilExpiry} days)`}
                                                    {licenseStatus === 'expired' && ' (Expired)'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="compliance-bar">
                                                    <div
                                                        className="compliance-fill"
                                                        style={{
                                                            width: `${driver.checklistCompliance || 0}%`,
                                                            background: (driver.checklistCompliance || 0) >= 80
                                                                ? 'var(--green-500)'
                                                                : (driver.checklistCompliance || 0) >= 50
                                                                    ? 'var(--yellow-500)'
                                                                    : 'var(--red-500)'
                                                        }}
                                                    />
                                                </div>
                                                <span className="compliance-text">{driver.checklistCompliance || 0}%</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={driver.status === 'Active' ? 'active' : 'inactive'}>
                                                    {driver.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="row-actions">
                                                    <button
                                                        className="action-btn edit"
                                                        title="Edit"
                                                        onClick={() => handleOpenModal(driver)}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        title="Delete"
                                                        onClick={() => handleDelete(driver._id)}
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

            {/* Add/Edit Driver Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Saving...' : editingDriver ? 'Save Changes' : 'Add Driver'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter driver name"
                        required
                    />

                    <Input
                        label="Mobile Number"
                        name="mobile"
                        type="tel"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        required
                    />

                    <Input
                        label="License Number"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="MH-1220220012345"
                        required
                    />

                    <Input
                        label="License Expiry Date"
                        name="licenseExpiry"
                        type="date"
                        value={formData.licenseExpiry}
                        onChange={handleChange}
                        required
                    />

                    {!editingDriver && (
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password for driver login"
                            required
                        />
                    )}

                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                            className="form-input"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Drivers;
