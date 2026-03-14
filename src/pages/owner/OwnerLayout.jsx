import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { authService } from '../../services';
import '../../App.css';

export function OwnerLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const storedUser = authService.getCurrentUser();
    const user = storedUser || { name: 'Owner', role: 'owner' };

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/login');
        }
    }, [navigate]);

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
