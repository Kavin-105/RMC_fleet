import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Truck,
    Users,
    FileText,
    Receipt,
    LogOut,
    Building2
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/owner', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/owner/vehicles', icon: Truck, label: 'Vehicles' },
    { path: '/owner/drivers', icon: Users, label: 'Drivers' },
    { path: '/owner/documents', icon: FileText, label: 'Documents' },
    { path: '/owner/expenses', icon: Receipt, label: 'Expenses' },
];

export function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <NavLink to="/owner" className="sidebar-logo" onClick={onClose}>
                        <div className="sidebar-logo-icon">
                            <Building2 />
                        </div>
                        <div className="sidebar-logo-text">
                            <span className="sidebar-logo-title">RMC Fleet</span>
                            <span className="sidebar-logo-subtitle">Fleet Manager</span>
                        </div>
                    </NavLink>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section">
                        <p className="sidebar-section-title">Main Menu</p>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                                onClick={onClose}
                            >
                                <item.icon />
                                {item.label}
                                {item.badge && (
                                    <span className="sidebar-badge">{item.badge}</span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user" onClick={handleLogout}>
                        <div className="sidebar-avatar">
                            <LogOut size={18} />
                        </div>
                        <div className="sidebar-user-info">
                            <p className="sidebar-user-name">Logout</p>
                            <p className="sidebar-user-role">Sign out</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
