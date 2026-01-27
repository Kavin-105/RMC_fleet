import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Truck, Calendar, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    Button,
    Card,
    Badge,
    Modal,
    Input,
    Select
} from '../../components/ui';
import { documentService, vehicleService } from '../../services';
import './Documents.css';

const documentTypes = ['All', 'RC Book', 'Insurance', 'Fitness', 'Permit', 'Pollution', 'Service'];

const typeIcons = {
    'RC Book': '📄',
    'Insurance': '🛡️',
    'Fitness': '✅',
    'Permit': '📋',
    'Pollution': '🌿',
    'Service': '🔧'
};

export function Documents() {
    const [documents, setDocuments] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        vehicle: '',
        type: '',
        expiryDate: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [docsRes, vehiclesRes] = await Promise.all([
                documentService.getAll(),
                vehicleService.getAll()
            ]);
            setDocuments(docsRes.data || []);
            setVehicles(vehiclesRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load documents');
            setDocuments([]);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        const vehicleNumber = doc.vehicle?.vehicleNumber || '';
        const matchesSearch = vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || doc.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const handleOpenModal = () => {
        setFormData({
            vehicle: '',
            type: '',
            expiryDate: ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await documentService.create(formData);
            toast.success('Document added successfully!');
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error saving document:', error);
            toast.error(error.response?.data?.message || 'Failed to save document');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await documentService.delete(docId);
            toast.success('Document deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Calculate days until expiry
    const getDaysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const vehicleOptions = vehicles.map(v => ({
        value: v._id,
        label: `${v.vehicleNumber} - ${v.model}`
    }));

    const typeOptions = documentTypes.slice(1).map(t => ({
        value: t,
        label: t
    }));

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
                    <h1 className="page-title">Documents</h1>
                    <p className="page-subtitle">Track vehicle documents and expiry dates</p>
                </div>
                <Button icon={Plus} onClick={handleOpenModal}>
                    Add Document
                </Button>
            </div>

            {/* Type Filter Tabs */}
            <div className="document-tabs">
                {documentTypes.map((type) => (
                    <button
                        key={type}
                        className={`document-tab ${typeFilter === type ? 'active' : ''}`}
                        onClick={() => setTypeFilter(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="page-filters" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="filter-search">
                    <Search size={18} className="filter-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by vehicle number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Documents Grid */}
            {filteredDocuments.length === 0 ? (
                <Card>
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <FileText size={48} style={{ color: 'var(--grey-300)', marginBottom: 'var(--space-4)' }} />
                        <p style={{ color: 'var(--grey-500)' }}>No documents found. Add your first document!</p>
                    </div>
                </Card>
            ) : (
                <div className="documents-grid">
                    {filteredDocuments.map((doc) => {
                        const daysUntilExpiry = getDaysUntilExpiry(doc.expiryDate);
                        const status = doc.status || (daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry <= 30 ? 'Expiring' : 'Valid');

                        return (
                            <Card key={doc._id} className={`document-card ${status.toLowerCase()}`}>
                                <div className="document-card-header">
                                    <span className="document-type-icon">{typeIcons[doc.type] || '📄'}</span>
                                    <Badge variant={status.toLowerCase()}>
                                        {status}
                                    </Badge>
                                </div>

                                <h3 className="document-card-type">{doc.type}</h3>

                                <div className="document-card-vehicle">
                                    <Truck size={14} />
                                    <span>{doc.vehicle?.vehicleNumber || 'Unknown'}</span>
                                </div>

                                <div className="document-card-expiry">
                                    <Calendar size={14} />
                                    <span>
                                        Expires: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}
                                        {daysUntilExpiry > 0 && daysUntilExpiry <= 30 && (
                                            <span className="days-warning"> ({daysUntilExpiry} days)</span>
                                        )}
                                        {daysUntilExpiry < 0 && (
                                            <span className="days-expired"> (Expired)</span>
                                        )}
                                    </span>
                                </div>

                                <button
                                    className="document-delete-btn"
                                    onClick={() => handleDelete(doc._id)}
                                >
                                    Delete
                                </button>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Add Document Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Add New Document"
                footer={
                    <>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Saving...' : 'Add Document'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <Select
                        label="Vehicle"
                        name="vehicle"
                        value={formData.vehicle}
                        onChange={handleChange}
                        options={vehicleOptions}
                        placeholder="Select a vehicle"
                        required
                    />

                    <Select
                        label="Document Type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        options={typeOptions}
                        placeholder="Select document type"
                        required
                    />

                    <Input
                        label="Expiry Date"
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        required
                    />

                    <div className="upload-placeholder">
                        <Upload size={24} />
                        <p>Click to upload document</p>
                        <span>PDF, JPG, PNG (Max 5MB)</span>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Documents;
