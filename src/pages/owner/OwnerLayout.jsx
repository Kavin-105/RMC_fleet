import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import '../../App.css';

export function OwnerLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Mock user data - will be replaced with actual auth
    const user = {
        name: 'Amit Sharma',
        role: 'Owner'
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <main className="dashboard-main">
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    user={user}
                />
                <div className="dashboard-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default OwnerLayout;
