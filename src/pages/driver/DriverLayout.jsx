import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Truck,
    Bell,
    Home,
    ClipboardCheck,
    Receipt,
    User,
    LogOut,
    Menu,
    X,
    Building2
} from 'lucide-react';
import './DriverLayout.css';

const navItems = [
    { path: '/driver', icon: Home, label: 'Dashboard', end: true },
    { path: '/driver/checklist', icon: ClipboardCheck, label: 'Daily Checklist' },
    { path: '/driver/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/driver/notifications', icon: Bell, label: 'Notifications' },
];

export function DriverLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Get driver info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const driverName = user.name || 'Driver';

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('driver');
        navigate('/login');
    };

    return (
        <div className="driver-layout">
            {/* Sidebar Overlay for mobile */}
            <div
                className={`driver-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`driver-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="driver-sidebar-header">
                    <NavLink to="/driver" className="driver-sidebar-logo" onClick={() => setSidebarOpen(false)}>
                        <div className="driver-sidebar-logo-icon">
                            <Truck size={20} />
                        </div>
                        <div className="driver-sidebar-logo-text">
                            <span className="driver-sidebar-logo-title">RMC Fleet</span>
                            <span className="driver-sidebar-logo-subtitle">Driver Portal</span>
                        </div>
                    </NavLink>
                    <button className="driver-sidebar-close" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="driver-sidebar-nav">
                    <p className="driver-sidebar-section-title">Main Menu</p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `driver-sidebar-link ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="driver-sidebar-footer">
                    <div className="driver-sidebar-user">
                        <div className="driver-sidebar-avatar">
                            {driverName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="driver-sidebar-user-info">
                            <p className="driver-sidebar-user-name">{driverName}</p>
                            <p className="driver-sidebar-user-role">Driver</p>
                        </div>
                    </div>
                    <button className="driver-sidebar-logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="driver-main">
                {/* Header */}
                <header className="driver-header">
                    <button className="driver-menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className="driver-header-title">
                        <h1>Driver Portal</h1>
                    </div>
                    <div className="driver-header-actions">
                        <button
                            className="driver-header-btn"
                            onClick={() => navigate('/driver/notifications')}
                        >
                            <Bell size={22} />
                            <span className="driver-header-badge" />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="driver-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default DriverLayout;
