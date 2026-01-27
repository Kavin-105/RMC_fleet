import {
    BellOff,
    CheckCircle,
    AlertTriangle,
    FileWarning,
    Receipt,
    Wrench,
    ClipboardCheck
} from 'lucide-react';
import './DriverNotifications.css';

const mockNotifications = [
    {
        id: '1',
        type: 'success',
        icon: CheckCircle,
        title: 'Expense Approved',
        message: 'Your fuel expense of ₹5,500 has been approved by the owner.',
        time: '30 minutes ago',
        unread: true
    },
    {
        id: '2',
        type: 'warning',
        icon: ClipboardCheck,
        title: 'Daily Checklist Reminder',
        message: 'Don\'t forget to complete your daily vehicle checklist before starting your trip.',
        time: '2 hours ago',
        unread: true
    },
    {
        id: '3',
        type: 'info',
        icon: FileWarning,
        title: 'Document Expiring Soon',
        message: 'Vehicle insurance for MH-12-AB-1234 expires in 19 days. Please inform the owner.',
        time: 'Today',
        unread: false
    },
    {
        id: '4',
        type: 'warning',
        icon: Wrench,
        title: 'Maintenance Due',
        message: 'Engine oil change is due in 500 km. Schedule maintenance soon.',
        time: 'Yesterday',
        unread: false
    },
    {
        id: '5',
        type: 'error',
        icon: Receipt,
        title: 'Expense Rejected',
        message: 'Your spare parts expense of ₹8,700 was rejected. Reason: Missing bill.',
        time: '2 days ago',
        unread: false
    },
    {
        id: '6',
        type: 'success',
        icon: CheckCircle,
        title: 'Expense Approved',
        message: 'Your toll expense of ₹350 has been approved.',
        time: '3 days ago',
        unread: false
    }
];

export function DriverNotifications() {
    const todayNotifications = mockNotifications.filter(n =>
        n.time.includes('minutes') || n.time.includes('hours') || n.time === 'Today'
    );

    const olderNotifications = mockNotifications.filter(n =>
        !n.time.includes('minutes') && !n.time.includes('hours') && n.time !== 'Today'
    );

    if (mockNotifications.length === 0) {
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
                <h1 className="driver-page-title">Notifications</h1>
                <p className="driver-page-subtitle">{mockNotifications.filter(n => n.unread).length} unread</p>
            </div>

            {/* Today's Notifications */}
            {todayNotifications.length > 0 && (
                <div className="notification-group">
                    <h3 className="notification-group-title">Today</h3>
                    <div className="notifications-list">
                        {todayNotifications.map((notification) => {
                            const Icon = notification.icon;
                            return (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                                >
                                    <div className={`notification-icon ${notification.type}`}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="notification-content">
                                        <h4 className="notification-title">{notification.title}</h4>
                                        <p className="notification-message">{notification.message}</p>
                                        <span className="notification-time">{notification.time}</span>
                                    </div>
                                    {notification.unread && <div className="notification-dot" />}
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
                            const Icon = notification.icon;
                            return (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                                >
                                    <div className={`notification-icon ${notification.type}`}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="notification-content">
                                        <h4 className="notification-title">{notification.title}</h4>
                                        <p className="notification-message">{notification.message}</p>
                                        <span className="notification-time">{notification.time}</span>
                                    </div>
                                    {notification.unread && <div className="notification-dot" />}
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
