import { useState, useEffect, useRef } from 'react';
import { Plus, Search, User, Edit2, Trash2, Phone, FileText, Loader2, Upload, CheckCircle } from 'lucide-react';
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
    const [extractingLicense, setExtractingLicense] = useState(false);
    const [licenseFile, setLicenseFile] = useState(null);
    const [licenseExtracted, setLicenseExtracted] = useState(false);
    const fileInputRef = useRef(null);
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
            setLicenseExtracted(true); // Already has license for editing
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
            setLicenseExtracted(false);
        }
        setLicenseFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDriver(null);
        setLicenseFile(null);
        setLicenseExtracted(false);
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

    const handleLicenseFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a PDF or image file (JPG, PNG)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setLicenseFile(file);
        setExtractingLicense(true);
        setLicenseExtracted(false);

        try {
            const response = await driverService.extractLicense(file);
            
            if (response.success && response.data.licenseNumber) {
                setFormData(prev => ({
                    ...prev,
                    licenseNumber: response.data.licenseNumber,
                    // Parse expiry date if available (format: DD-MM-YYYY to YYYY-MM-DD)
                    licenseExpiry: response.data.expiryDate 
                        ? response.data.expiryDate.split('-').reverse().join('-')
                        : prev.licenseExpiry
                }));
                setLicenseExtracted(true);
                toast.success('License number extracted successfully!');
            } else {
                toast.error(response.message || 'Could not extract license number. Please enter manually.');
            }
        } catch (error) {
            console.error('License extraction error:', error);
            toast.error(error.response?.data?.message || 'Failed to extract license number. Please enter manually.');
        } finally {
            setExtractingLicense(false);
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

                    {/* License Upload Section */}
                    <div className="form-group">
                        <label className="form-label">
                            Upload Driver License <span style={{ color: 'var(--gray-500)', fontWeight: 'normal' }}>(Image or PDF)</span>
                        </label>
                        <div 
                            className="license-upload-area"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed var(--gray-300)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-4)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: licenseExtracted ? 'var(--green-50)' : 'var(--gray-50)',
                                borderColor: licenseExtracted ? 'var(--green-400)' : 'var(--gray-300)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,image/*"
                                onChange={handleLicenseFileChange}
                                style={{ display: 'none' }}
                            />
                            {extractingLicense ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                                    <Loader2 size={20} className="spin" style={{ color: 'var(--primary-500)' }} />
                                    <span style={{ color: 'var(--gray-600)' }}>Extracting license number...</span>
                                </div>
                            ) : licenseExtracted ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                                    <CheckCircle size={20} style={{ color: 'var(--green-500)' }} />
                                    <span style={{ color: 'var(--green-600)' }}>License number extracted!</span>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={24} style={{ color: 'var(--gray-400)', marginBottom: 'var(--space-2)' }} />
                                    <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: '0.875rem' }}>
                                        {licenseFile ? licenseFile.name : 'Click to upload license image or PDF'}
                                    </p>
                                    <p style={{ color: 'var(--gray-400)', margin: 'var(--space-1) 0 0', fontSize: '0.75rem' }}>
                                        License number will be extracted automatically using AI
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Input
                        label="License Number"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="MH-1220220012345"
                        required
                        disabled={extractingLicense}
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
