import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Zap, Phone } from 'lucide-react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { signIn, signInWithGoogle, signInWithPhone } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    const handlePhoneLogin = async () => {
        const phone = window.prompt('Enter your phone number (e.g. +1234567890):');
        if (phone) {
            setError('');
            setIsLoading(true);
            const { error } = await signInWithPhone(phone);
            if (error) {
                setError(error.message);
                setIsLoading(false);
            } else {
                alert('Success! Please check your phone for the OTP. You can then enter it here or login via email.');
                setIsLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const { data, error } = await signIn(email, password);

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <main style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#000',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Cursor Glow Effect - BRIGHTER */}
            <div
                style={{
                    pointerEvents: 'none',
                    position: 'fixed',
                    width: '40px',
                    height: '40px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(34, 211, 238, 0.5) 50%, transparent 100%)',
                    borderRadius: '50%',
                    filter: 'blur(10px)',
                    left: `${mousePosition.x - 20}px`,
                    top: `${mousePosition.y - 20}px`,
                    opacity: 1,
                    transition: 'opacity 100ms'
                }}
            />

            <div style={{ width: '100%', maxWidth: '300px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Logo Section */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', textAlign: 'center', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>CITYCYCLE</h1>
                </div>

                {/* Header Text */}
                <div style={{ textAlign: 'center', width: '100%', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '500', color: '#a1a1aa', marginBottom: '8px', textAlign: 'center', fontFamily: "'Outfit', sans-serif" }}>Welcome Back</h2>
                </div>

                {/* Login Card - FIXED WIDTH */}
                <div style={{
                    backgroundColor: 'rgba(24, 24, 27, 0.65)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '32px',
                    transition: 'all 300ms',
                    width: '100%'
                }}>
                    {error && (
                        <div style={{
                            marginBottom: '24px',
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#f87171',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
                        {/* Email Input */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                            <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#fafafa', textAlign: 'center' }}>
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    backgroundColor: '#27272a',
                                    border: '1px solid #3f3f46',
                                    borderRadius: '8px',
                                    color: '#fafafa',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    transition: 'all 200ms',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#10b981';
                                    e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#3f3f46';
                                    e.target.style.boxShadow = 'none';
                                }}
                                onMouseEnter={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
                                onMouseLeave={(e) => !e.target.matches(':focus') && (e.target.style.borderColor = '#3f3f46')}
                            />
                        </div>

                        {/* Password Input */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                                <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#fafafa', textAlign: 'center' }}>
                                    Password
                                </label>
                                <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: '#10b981', textDecoration: 'none', transition: 'color 200ms', position: 'absolute', right: 0 }}
                                    onMouseEnter={(e) => e.target.style.color = 'rgba(16, 185, 129, 0.8)'}
                                    onMouseLeave={(e) => e.target.style.color = '#10b981'}>
                                    Forgot?
                                </Link>
                            </div>
                            <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        paddingRight: '40px',
                                        backgroundColor: '#27272a',
                                        border: '1px solid #3f3f46',
                                        borderRadius: '8px',
                                        color: '#fafafa',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        transition: 'all 200ms',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#10b981';
                                        e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#3f3f46';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    onMouseEnter={(e) => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
                                    onMouseLeave={(e) => !e.target.matches(':focus') && (e.target.style.borderColor = '#3f3f46')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#71717a',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        transition: 'color 200ms'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fafafa'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#71717a'}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <input
                                id="remember"
                                type="checkbox"
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    marginRight: '8px',
                                    cursor: 'pointer',
                                    accentColor: '#10b981'
                                }}
                            />
                            <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#a1a1aa', cursor: 'pointer', transition: 'color 200ms' }}
                                onMouseEnter={(e) => e.target.style.color = '#fafafa'}
                                onMouseLeave={(e) => e.target.style.color = '#a1a1aa'}>
                                Remember me
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                backgroundColor: '#10b981',
                                color: '#18181b',
                                fontWeight: '600',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                transition: 'all 300ms',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                fontSize: '0.875rem',
                                boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.9)', e.target.style.transform = 'scale(1.02)', e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)')}
                            onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#10b981', e.target.style.transform = 'scale(1)', e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)')}
                            onMouseDown={(e) => !isLoading && (e.target.style.transform = 'scale(0.98)')}
                            onMouseUp={(e) => !isLoading && (e.target.style.transform = 'scale(1.02)')}
                        >
                            {isLoading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #18181b',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#27272a' }} />
                        <span style={{ fontSize: '0.75rem', color: '#71717a' }}>or continue with</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#27272a' }} />
                    </div>

                    {/* Social Login Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                padding: '10px 16px',
                                border: '1px solid #3f3f46',
                                borderRadius: '8px',
                                backgroundColor: 'transparent',
                                color: '#fafafa',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 200ms',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#27272a';
                                e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.borderColor = '#3f3f46';
                                e.target.style.boxShadow = 'none';
                            }}
                            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>

                        {/* Phone Button */}
                        <button
                            onClick={handlePhoneLogin}
                            style={{
                                padding: '10px 16px',
                                border: '1px solid #3f3f46',
                                borderRadius: '8px',
                                backgroundColor: 'transparent',
                                color: '#fafafa',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 200ms',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#27272a';
                                e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.borderColor = '#3f3f46';
                                e.target.style.boxShadow = 'none';
                            }}
                            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            <Phone style={{ width: '16px', height: '16px' }} />
                            Phone
                        </button>
                    </div>
                </div>

                {/* Sign Up Link */}
                <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#71717a', marginTop: '24px' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600', transition: 'color 200ms' }}
                        onMouseEnter={(e) => e.target.style.color = 'rgba(16, 185, 129, 0.8)'}
                        onMouseLeave={(e) => e.target.style.color = '#10b981'}>
                        Sign up
                    </Link>
                </p>

                {/* Footer Note */}
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#71717a', marginTop: '32px' }}>
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </main>
    );
}
