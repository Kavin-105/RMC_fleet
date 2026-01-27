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
    ChevronDown
} from 'lucide-react';
import './DriverLayout.css';

export function DriverLayout() {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Get driver info from localStorage or use default
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const driverName = user.name || 'Rajesh Kumar';

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="driver-layout">
            {/* Header */}
            <header className="driver-header">
                <div className="driver-header-logo">
                    <div className="driver-header-logo-icon">
                        <Truck size={20} />
                    </div>
                    <span className="driver-header-title">RMC Driver</span>
                </div>
                <div className="driver-header-actions">
                    <button
                        className="driver-header-btn"
                        onClick={() => navigate('/driver/notifications')}
                    >
                        <Bell size={22} />
                        <span className="driver-header-badge" />
                    </button>

                    {/* Profile Dropdown */}
                    <div className="driver-profile-dropdown" ref={profileRef}>
                        <button
                            className="driver-header-btn driver-profile-btn"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <User size={22} />
                        </button>

                        {isProfileOpen && (
                            <div className="driver-dropdown-menu">
                                <div className="driver-dropdown-header">
                                    <div className="driver-dropdown-avatar">
                                        {driverName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="driver-dropdown-info">
                                        <p className="driver-dropdown-name">{driverName}</p>
                                        <p className="driver-dropdown-role">Driver</p>
                                    </div>
                                </div>
                                <div className="driver-dropdown-divider" />
                                <button className="driver-dropdown-item" onClick={handleLogout}>
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="driver-content">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="driver-nav">
                <NavLink
                    to="/driver"
                    end
                    className={({ isActive }) => `driver-nav-item ${isActive ? 'active' : ''}`}
                >
                    <Home />
                    <span>Home</span>
                </NavLink>
                <NavLink
                    to="/driver/checklist"
                    className={({ isActive }) => `driver-nav-item ${isActive ? 'active' : ''}`}
                >
                    <ClipboardCheck />
                    <span>Checklist</span>
                </NavLink>
                <NavLink
                    to="/driver/expenses"
                    className={({ isActive }) => `driver-nav-item ${isActive ? 'active' : ''}`}
                >
                    <Receipt />
                    <span>Expenses</span>
                </NavLink>
                <NavLink
                    to="/driver/notifications"
                    className={({ isActive }) => `driver-nav-item ${isActive ? 'active' : ''}`}
                >
                    <Bell />
                    <span>Alerts</span>
                </NavLink>
            </nav>
        </div>
    );
}

export default DriverLayout;
