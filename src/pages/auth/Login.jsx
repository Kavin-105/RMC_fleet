import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Truck, User, Phone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui';
import { authService } from '../../services';
import './Login.css';

export function Login() {
    const navigate = useNavigate();
    const [role, setRole] = useState('owner');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        mobile: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const credentials = role === 'owner'
                ? { email: formData.email, password: formData.password }
                : { mobile: formData.mobile, password: formData.password };

            const response = await authService.login(credentials);

            if (response.success) {
                toast.success(`Welcome, ${response.data.user.name}!`);

                if (response.data.user.role === 'owner') {
                    navigate('/owner');
                } else {
                    navigate('/driver');
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);

            // Fallback to demo mode if backend is not available
            if (error.code === 'ERR_NETWORK') {
                toast.error('Backend not connected. Using demo mode.');
                if (role === 'owner') {
                    localStorage.setItem('token', 'demo-token');
                    localStorage.setItem('user', JSON.stringify({ id: 'demo', role: 'owner', name: 'Amit Sharma' }));
                    navigate('/owner');
                } else {
                    localStorage.setItem('token', 'demo-token');
                    localStorage.setItem('user', JSON.stringify({ id: 'demo', role: 'driver', name: 'Rajesh Kumar' }));
                    navigate('/driver');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <div className="login-logo-icon">
                            <Building2 size={28} />
                        </div>
                    </div>
                    <h1 className="login-title">RMC Fleet Manager</h1>
                    <p className="login-subtitle">Transit Mixer Fleet Management System</p>
                </div>

                {/* Role Selector */}
                <div className="role-selector">
                    <div
                        className={`role-option ${role === 'owner' ? 'selected' : ''}`}
                        onClick={() => setRole('owner')}
                    >
                        <div className="role-option-icon">
                            <User size={24} />
                        </div>
                        <h3 className="role-option-title">Owner</h3>
                        <p className="role-option-desc">Web Dashboard</p>
                    </div>
                    <div
                        className={`role-option ${role === 'driver' ? 'selected' : ''}`}
                        onClick={() => setRole('driver')}
                    >
                        <div className="role-option-icon">
                            <Truck size={24} />
                        </div>
                        <h3 className="role-option-title">Driver</h3>
                        <p className="role-option-desc">Mobile App</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {role === 'owner' ? (
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="owner@company.com"
                            icon={User}
                            required
                        />
                    ) : (
                        <Input
                            label="Mobile Number"
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="Enter your mobile number"
                            icon={Phone}
                            required
                        />
                    )}

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        style={{ marginTop: 'var(--space-4)' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spin" style={{ marginRight: 8 }} />
                                Signing In...
                            </>
                        ) : (
                            `Sign In as ${role === 'owner' ? 'Owner' : 'Driver'}`
                        )}
                    </Button>
                </form>

                <div className="demo-credentials">
                    <p className="demo-credentials-title">Demo Credentials</p>
                    {role === 'owner' ? (
                        <>
                            <p className="demo-credentials-item"><strong>Email:</strong> owner@demo.com</p>
                            <p className="demo-credentials-item"><strong>Password:</strong> demo123</p>
                        </>
                    ) : (
                        <>
                            <p className="demo-credentials-item"><strong>Mobile:</strong> 9876543210</p>
                            <p className="demo-credentials-item"><strong>Password:</strong> driver123</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;
