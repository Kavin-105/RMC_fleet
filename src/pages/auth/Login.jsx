import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Truck, User, Phone, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui';
import { authService } from '../../services';
import './Login.css';

export function Login() {
    const navigate = useNavigate();
    const [role, setRole] = useState('owner');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        mobile: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Client-side validation
        if (role === 'owner') {
            if (!formData.email || !formData.email.trim()) {
                setError('Email is required');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setError('Please enter a valid email address');
                return;
            }
        } else {
            if (!formData.mobile || !formData.mobile.trim()) {
                setError('Mobile number is required');
                return;
            }
            if (!/^\d{10}$/.test(formData.mobile.trim())) {
                setError('Please enter a valid 10-digit mobile number');
                return;
            }
        }

        if (!formData.password || !formData.password.trim()) {
            setError('Password is required');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

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
            } else {
                setError(response.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            let message = error.response?.data?.message || 'Login failed. Please try again.';
            
            // Check for specific authentication errors
            if (error.response?.status === 401 || error.response?.status === 400) {
                message = 'Incorrect email/mobile or password. Please try again.';
            }
            
            setError(message);
            toast.error(message);
            
            // Show browser alert for incorrect credentials
            if (error.response?.status === 401 || error.response?.status === 400) {
                alert('⚠️ Login Failed\n\n' + message + '\n\nPlease check your credentials and try again.');
            }

            // Fallback notification if backend is not available
            if (error.code === 'ERR_NETWORK') {
                toast.error('Cannot connect to server. Please ensure the backend is running.');
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
                    {error && (
                        <div className="login-error-message">
                            {error}
                        </div>
                    )}

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
                        className="login-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spin login-spinner" />
                                Signing In...
                            </>
                        ) : (
                            `Sign In as ${role === 'owner' ? 'Owner' : 'Driver'}`
                        )}
                    </Button>

                    {role === 'owner' && (
                        <div className="login-forgot-wrapper">
                            <button
                                type="button"
                                className="login-forgot-btn"
                                onClick={() => setShowForgotPassword(true)}
                            >
                                <KeyRound size={14} className="login-forgot-icon" />
                                Forgot Password?
                            </button>
                        </div>
                    )}
                </form>

                {/* Forgot Password Modal */}
                {showForgotPassword && (
                    <div className="login-modal-overlay">
                        <div className="login-modal-content">
                            <h3 className="login-modal-title">Reset Password</h3>
                            <p className="login-modal-desc">
                                Enter your email address and we'll send you a password reset link.
                            </p>
                            <Input
                                label="Email Address"
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="Enter your email"
                                icon={User}
                            />
                            <div className="login-modal-actions">
                                <Button
                                    variant="secondary"
                                    className="login-modal-btn"
                                    onClick={() => { setShowForgotPassword(false); setForgotEmail(''); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="login-modal-btn"
                                    onClick={async () => {
                                        if (!forgotEmail) { toast.error('Please enter your email'); return; }
                                        setForgotLoading(true);
                                        try {
                                            await authService.forgotPassword(forgotEmail);
                                            toast.success('Password reset email sent! Check your inbox.');
                                            setShowForgotPassword(false);
                                            setForgotEmail('');
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || 'Failed to send reset email');
                                        } finally {
                                            setForgotLoading(false);
                                        }
                                    }}
                                    disabled={forgotLoading}
                                >
                                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;
