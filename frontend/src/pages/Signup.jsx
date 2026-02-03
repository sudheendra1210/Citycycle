import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'viewer'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);

        const { data, error } = await signUp(formData.email, formData.password, {
            name: formData.name,
            role: formData.role
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            alert('Account created! Please check your email to verify your account.');
            navigate('/login');
        }
    };

    const inputStyle = {
        width: '100%',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        color: '#fafafa',
        fontSize: '0.875rem',
        padding: '10px 16px',
        outline: 'none',
        transition: 'all 200ms',
        boxSizing: 'border-box'
    };

    return (
        <main style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#000',
            padding: '1rem',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ width: '100%', maxWidth: '380px' }}>
                {/* Logo and Brand */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '-0.02em' }}>SMARTWASTE</span>
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: 'white', margin: '0 0 0.5rem 0' }}>Create Account</h1>
                </div>

                {/* Signup Card */}
                <div style={{
                    backgroundColor: 'rgba(24, 24, 27, 0.65)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '2rem'
                }}>
                    {error && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#f87171',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Name Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa', marginBottom: '0.5rem' }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                style={inputStyle}
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa', marginBottom: '0.5rem' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                style={inputStyle}
                            />
                        </div>

                        {/* Role Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa', marginBottom: '0.5rem' }}>
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={loading}
                                style={inputStyle}
                            >
                                <option value="viewer">Viewer (Read-only)</option>
                                <option value="operator">Operator (Manage bins & vehicles)</option>
                                <option value="admin">Admin (Full access)</option>
                            </select>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa', marginBottom: '0.5rem' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#71717a',
                                        cursor: 'pointer',
                                        padding: '0.25rem'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa', marginBottom: '0.5rem' }}>
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#71717a',
                                        cursor: 'pointer',
                                        padding: '0.25rem'
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                backgroundColor: '#10b981',
                                color: '#18181b',
                                fontWeight: '600',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: 'all 200ms',
                                fontSize: '0.875rem',
                                marginTop: '0.5rem'
                            }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Sign In Link */}
                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#71717a' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '500' }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default Signup;
