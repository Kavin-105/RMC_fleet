import { useState, useEffect } from 'react';
import {
    BellOff,
    CheckCircle,
    AlertTriangle,
    FileWarning,
    Receipt,
    Wrench,
    ClipboardCheck,
    Loader2,
    CheckCheck,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services';
import './DriverNotifications.css';

const getNotificationIcon = (type, severity) => {
    switch (type) {
        case 'document_expiring':
            return FileWarning;
        case 'document_expired':
            return AlertTriangle;
        case 'license_expiring':
        case 'license_expired':
            return FileWarning;
        default:
            return CheckCircle;
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

const isToday = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

export function DriverNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

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
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const handleClearRead = async () => {
        try {
            await notificationService.clearRead();
            setNotifications(prev => prev.filter(n => !n.isRead));
            toast.success('Read notifications cleared');
        } catch (error) {
            console.error('Error clearing notifications:', error);
            toast.error('Failed to clear notifications');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const todayNotifications = notifications.filter(n => isToday(n.createdAt));
    const olderNotifications = notifications.filter(n => !isToday(n.createdAt));

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 size={32} className="spin" />
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div>
                <div className="driver-page-header">
                    <h1 className="driver-page-title">Notifications</h1>
                    <p className="driver-page-subtitle">Stay updated with alerts</p>
                </div>

                <div className="notifications-empty">
                    <div className="notifications-empty-icon">
                        <BellOff size={36} />
                    </div>
                    <h4 className="notifications-empty-title">No Notifications</h4>
                    <p className="notifications-empty-text">
                        You're all caught up! New notifications will appear here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="driver-page-header">
                <div>
                    <h1 className="driver-page-title">Notifications</h1>
                    <p className="driver-page-subtitle">{unreadCount} unread</p>
                </div>
                <div className="notification-actions-header">
                    {unreadCount > 0 && (
                        <button className="notification-header-btn" onClick={handleMarkAllAsRead}>
                            <CheckCheck size={16} /> Mark all read
                        </button>
                    )}
                    {notifications.some(n => n.isRead) && (
                        <button className="notification-header-btn clear" onClick={handleClearRead}>
                            <Trash2 size={16} /> Clear read
                        </button>
                    )}
                </div>
            </div>

            {/* Today's Notifications */}
            {todayNotifications.length > 0 && (
                <div className="notification-group">
                    <h3 className="notification-group-title">Today</h3>
                    <div className="notifications-list">
                        {todayNotifications.map((notification) => {
                            const Icon = getNotificationIcon(notification.type, notification.severity);
                            return (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                >
                                    <div className={`notification-icon ${notification.severity}`}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="notification-content">
                                        <h4 className="notification-title">{notification.title}</h4>
                                        <p className="notification-message">{notification.message}</p>
                                        <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                                    </div>
                                    {!notification.isRead && <div className="notification-dot" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Older Notifications */}
            {olderNotifications.length > 0 && (
                <div className="notification-group">
                    <h3 className="notification-group-title">Earlier</h3>
                    <div className="notifications-list">
                        {olderNotifications.map((notification) => {
                            const Icon = getNotificationIcon(notification.type, notification.severity);
                            return (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                                >
                                    <div className={`notification-icon ${notification.severity}`}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="notification-content">
                                        <h4 className="notification-title">{notification.title}</h4>
                                        <p className="notification-message">{notification.message}</p>
                                        <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                                    </div>
                                    {!notification.isRead && <div className="notification-dot" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DriverNotifications;
