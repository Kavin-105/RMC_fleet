import { Menu, Search, Bell } from 'lucide-react';
import './Header.css';

export function Header({ title, onMenuClick, user }) {
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

    return (
        <header className="header">
            <div className="header-left">
                <button className="header-menu-btn" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                {title && <h1 className="header-title">{title}</h1>}
            </div>

            <div className="header-right">
                <div className="header-search">
                    <Search size={18} className="header-search-icon" />
                    <input
                        type="text"
                        className="header-search-input"
                        placeholder="Search vehicles, drivers..."
                    />
                </div>

                <button className="header-notification">
                    <Bell size={20} />
                    <span className="header-notification-badge" />
                </button>

                <div className="header-user">
                    <div className="header-avatar">{initials}</div>
                    <div className="header-user-info">
                        <p className="header-user-name">{user?.name || 'User'}</p>
                        <p className="header-user-role">{user?.role || 'Owner'}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
