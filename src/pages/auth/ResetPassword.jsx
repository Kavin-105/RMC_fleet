import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui';
import { authService } from '../../services';
import './Login.css';

export function ResetPassword() {
    const navigate = useNavigate();
    const { token } = useParams();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, password);
            toast.success('Password reset successful! Please login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
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
                    <h1 className="login-title">Reset Password</h1>
                    <p className="login-subtitle">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        icon={Lock}
                        required
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        icon={Lock}
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
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'none', border: 'none', color: 'var(--blue-600)',
                            cursor: 'pointer', fontSize: 'var(--font-size-sm)', textDecoration: 'underline'
                        }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
