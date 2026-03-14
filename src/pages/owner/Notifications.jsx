import { useState, useEffect } from 'react';
import {
    Bell,
    BellOff,
    CheckCircle,
    AlertTriangle,
    FileWarning,
    Loader2,
    CheckCheck,
    Trash2,
    Mail,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Badge } from '../../components/ui';
import { notificationService } from '../../services';
import './Notifications.css';

const getNotificationIcon = (type) => {
    switch (type) {
        case 'document_expiring':
            return FileWarning;
        case 'document_expired':
            return AlertTriangle;
        case 'license_expiring':
        case 'license_expired':
            return FileWarning;
        default:
            return Bell;
    }
};

const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN');
};

const filterOptions = ['All', 'Unread', 'Document Expiring', 'Document Expired', 'License'];

export function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationService.getAll();
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleClearRead = async () => {
        try {
            await notificationService.clearRead();
            setNotifications(prev => prev.filter(n => !n.isRead));
            toast.success('Read notifications cleared');
        } catch (error) {
            toast.error('Failed to clear notifications');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.delete(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'All') return true;
        if (filter === 'Unread') return !n.isRead;
        if (filter === 'Document Expiring') return n.type === 'document_expiring';
        if (filter === 'Document Expired') return n.type === 'document_expired';
        if (filter === 'License') return n.type === 'license_expiring' || n.type === 'license_expired';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

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
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                            : 'All caught up!'
                        }
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {unreadCount > 0 && (
                        <Button variant="secondary" icon={CheckCheck} onClick={handleMarkAllAsRead}>
                            Mark All Read
                        </Button>
                    )}
                    {notifications.some(n => n.isRead) && (
                        <Button variant="secondary" icon={Trash2} onClick={handleClearRead}>
                            Clear Read
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="notification-stats">
                <Card className="notification-stat-card">
                    <div className="notification-stat">
                        <div className="notification-stat-icon warning">
                            <FileWarning size={20} />
                        </div>
                        <div>
                            <p className="notification-stat-value">
                                {notifications.filter(n => n.type === 'document_expiring').length}
                            </p>
                            <p className="notification-stat-label">Expiring Soon</p>
                        </div>
                    </div>
                </Card>
                <Card className="notification-stat-card">
                    <div className="notification-stat">
                        <div className="notification-stat-icon error">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <p className="notification-stat-value">
                                {notifications.filter(n => n.type === 'document_expired').length}
                            </p>
                            <p className="notification-stat-label">Expired</p>
                        </div>
                    </div>
                </Card>
                <Card className="notification-stat-card">
                    <div className="notification-stat">
                        <div className="notification-stat-icon info">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="notification-stat-value">
                                {notifications.filter(n => n.emailSent).length}
                            </p>
                            <p className="notification-stat-label">Emails Sent</p>
                        </div>
                    </div>
                </Card>
                <Card className="notification-stat-card">
                    <div className="notification-stat">
                        <div className="notification-stat-icon success">
                            <Bell size={20} />
                        </div>
                        <div>
                            <p className="notification-stat-value">{unreadCount}</p>
                            <p className="notification-stat-label">Unread</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="document-tabs" style={{ marginBottom: 'var(--space-4)' }}>
                {filterOptions.map((option) => (
                    <button
                        key={option}
                        className={`document-tab ${filter === option ? 'active' : ''}`}
                        onClick={() => setFilter(option)}
                    >
                        {option}
                        {option === 'Unread' && unreadCount > 0 && (
                            <span style={{
                                background: 'var(--blue-500)',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '1px 6px',
                                fontSize: '11px',
                                marginLeft: '4px'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <Card>
                    <div className="owner-notifications-empty">
                        <BellOff size={48} style={{ color: 'var(--grey-300)', marginBottom: 'var(--space-4)' }} />
                        <h4 style={{ color: 'var(--grey-600)', marginBottom: 'var(--space-2)' }}>
                            {filter !== 'All' ? `No ${filter.toLowerCase()} notifications` : 'No notifications yet'}
                        </h4>
                        <p style={{ color: 'var(--grey-500)', fontSize: 'var(--font-size-sm)' }}>
                            {filter !== 'All'
                                ? 'Try changing the filter to see other notifications.'
                                : 'Document expiry alerts will appear here automatically.'
                            }
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="owner-notifications-list">
                    {filteredNotifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        return (
                            <Card
                                key={notification._id}
                                className={`owner-notification-card ${!notification.isRead ? 'unread' : ''} ${notification.severity}`}
                            >
                                <div className="owner-notification-content">
                                    <div className={`owner-notification-icon ${notification.severity}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="owner-notification-body">
                                        <div className="owner-notification-header">
                                            <h4 className="owner-notification-title">{notification.title}</h4>
                                            <div className="owner-notification-meta">
                                                <Badge variant={notification.severity === 'error' ? 'expired' : notification.severity === 'warning' ? 'expiring' : 'valid'}>
                                                    {notification.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                </Badge>
                                                {notification.emailSent && (
                                                    <span className="email-sent-badge" title="Email notification sent">
                                                        <Mail size={12} /> Email sent
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="owner-notification-message">{notification.message}</p>
                                        <div className="owner-notification-footer">
                                            <span className="owner-notification-time">{getTimeAgo(notification.createdAt)}</span>
                                            <div className="owner-notification-actions">
                                                {!notification.isRead && (
                                                    <button
                                                        className="notif-action-btn read"
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                    >
                                                        <CheckCircle size={14} /> Mark Read
                                                    </button>
                                                )}
                                                <button
                                                    className="notif-action-btn delete"
                                                    onClick={() => handleDelete(notification._id)}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {!notification.isRead && <div className="owner-notification-dot" />}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Notifications;
