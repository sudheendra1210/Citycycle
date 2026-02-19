import { useState, useEffect, useRef, useCallback } from "react";
import { useSignIn, SignIn } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { directSendOtp, directVerifyOtp } = useAuth();
    const navigate = useNavigate();

    const [method, setMethod] = useState(null);
    const [identifier, setIdentifier] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState(1);
    const [loginType, setLoginType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { isAuthenticated, loading: authLoading, user } = useAuth();
    useEffect(() => {
        if (isLoaded && !authLoading && isAuthenticated && user) {
            navigate("/");
        }
    }, [isLoaded, authLoading, isAuthenticated, user, navigate]);

    if (!isLoaded || authLoading) return null;

    const handleStartSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let normalized = identifier.replace(/\s+/g, '');

        if (loginType === 'hybrid' && method === 'phone') {
            if (/^\d{10}$/.test(normalized)) {
                normalized = '+91' + normalized;
            }
        }

        try {
            if (loginType === 'hybrid' && method === 'phone') {
                await directSendOtp(normalized);
                setStep(4);
            } else {
                const { supportedFirstFactors } = await signIn.create({
                    identifier: normalized,
                });

                const firstFactor = supportedFirstFactors.find((f) =>
                    f.strategy === 'email_code'
                );

                if (!firstFactor) {
                    throw new Error(`Email authentication not available for this account.`);
                }

                await signIn.prepareFirstFactor({
                    strategy: firstFactor.strategy,
                    emailAddressId: firstFactor.emailAddressId,
                });
                setStep(4);
            }
        } catch (err) {
            console.error("Auth Error:", err);
            const clerkError = err.errors?.[0];
            if (clerkError?.code === "form_identifier_not_found") {
                setError("Account not found. Please sign up first.");
            } else {
                setError(clerkError?.message || err.message || "Failed to start sign in.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (loginType === 'hybrid' && method === 'phone') {
                await directVerifyOtp(identifier, code);
                navigate("/");
            } else {
                const result = await signIn.attemptFirstFactor({
                    strategy: 'email_code',
                    code: code,
                });

                if (result.status === "complete") {
                    await setActive({ session: result.createdSessionId });
                    navigate("/");
                } else {
                    setError("Incomplete sign in. Please check your credentials.");
                }
            }
        } catch (err) {
            console.error("Verification Error:", err);
            setError(err.response?.data?.detail || err.errors?.[0]?.message || "Invalid verification code.");
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        setStep(1);
        setMethod(null);
        setLoginType(null);
        setIdentifier("");
        setError("");
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.brand}>CITYCYCLE</h1>
                <p style={styles.tagline}>Smart Waste Management</p>

                <div style={styles.card}>
                    {step > 1 && (
                        <button onClick={goBack} style={styles.backBtn}>← Back</button>
                    )}

                    {error && <div style={styles.error}>{error}</div>}

                    {/* Step 1: Choose login method directly */}
                    {step === 1 && (
                        <div>
                            <h2 style={styles.heading}>Welcome Back</h2>
                            <button
                                onClick={() => { setLoginType('clerk'); setStep(3); }}
                                style={styles.optionBtn}
                            >
                                🔗 Google / Social Login
                            </button>
                            <button
                                onClick={() => { setLoginType('hybrid'); setMethod('email'); setStep(3); }}
                                style={styles.optionBtn}
                            >
                                ✉️ Login with Email
                            </button>
                            <button
                                onClick={() => { setLoginType('hybrid'); setMethod('phone'); setIdentifier('+91'); setStep(3); }}
                                style={styles.optionBtn}
                            >
                                📞 Login with Phone
                            </button>
                            <div style={styles.divider}><span>or</span></div>
                            <Link to="/signup" style={styles.link}>
                                Don't have an account? <strong>Sign up</strong>
                            </Link>
                        </div>
                    )}

                    {/* Step 2 removed — options are now flat on step 1 */}

                    {/* Step 3: Clerk sign-in */}
                    {step === 3 && loginType === 'clerk' && (
                        <div>
                            <SignIn
                                appearance={{
                                    elements: {
                                        card: { backgroundColor: 'transparent', border: 'none', boxShadow: 'none', padding: 0, width: '100%' },
                                        rootBox: { width: '100%' },
                                        cardBox: { width: '100%', boxShadow: 'none' },
                                        headerTitle: { color: '#f1f5f9' },
                                        headerSubtitle: { color: '#94a3b8' },
                                        socialButtonsBlockButton: { backgroundColor: '#334155', border: '1px solid #475569', color: '#e2e8f0' },
                                        formButtonPrimary: { backgroundColor: '#10b981', color: '#fff' },
                                        formFieldLabel: { color: '#cbd5e1' },
                                        formFieldInput: { backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9' },
                                        footerActionText: { color: '#94a3b8' },
                                        footerActionLink: { color: '#10b981' },
                                        dividerLine: { backgroundColor: '#334155' },
                                        dividerText: { color: '#64748b' },
                                        identityPreviewText: { color: '#f1f5f9' },
                                        identityPreviewEditButtonIcon: { color: '#10b981' },
                                        footer: { background: 'transparent' },
                                        badge: { display: 'none' },
                                    }
                                }}
                            />
                        </div>
                    )}

                    {/* Step 3: Hybrid sign-in form */}
                    {step === 3 && loginType === 'hybrid' && (
                        <form onSubmit={handleStartSignIn}>
                            <h2 style={styles.heading}>Login Details</h2>
                            <label style={styles.label}>
                                {method === 'email' ? 'Email Address' : 'Phone Number'}
                            </label>
                            <input
                                type={method === 'email' ? 'email' : 'tel'}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder={method === 'email' ? 'you@example.com' : '+91XXXXXXXXXX'}
                                required
                                style={styles.input}
                                autoFocus
                            />

                            <button type="submit" disabled={loading} style={styles.primaryBtn}>
                                {loading ? "Sending..." : "Get Verification Code"}
                            </button>
                        </form>
                    )}

                    {/* Step 4: Verify OTP */}
                    {step === 4 && (
                        <form onSubmit={handleVerify}>
                            <h2 style={styles.heading}>Verify Code</h2>
                            <p style={styles.infoText}>
                                Enter the 6-digit code sent to <strong>{identifier}</strong>
                            </p>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                required
                                style={{ ...styles.input, textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
                                autoFocus
                            />
                            <button type="submit" disabled={loading} style={styles.primaryBtn}>
                                {loading ? "Verifying..." : "Verify & Sign In"}
                            </button>
                            <button type="button" onClick={handleStartSignIn} style={styles.resendBtn}>
                                Didn't receive a code? Resend
                            </button>
                        </form>
                    )}
                </div>

                <p style={styles.footer}>Secured by Clerk & Twilio</p>
            </div >
        </div >
    );
}

const styles = {
    page: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif',
    },
    container: {
        width: '100%', maxWidth: '420px', padding: '2rem', textAlign: 'center',
    },
    brand: {
        fontSize: '2rem', fontWeight: '800', color: '#f1f5f9', margin: '0 0 0.25rem 0',
        letterSpacing: '-0.03em',
    },
    tagline: {
        color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem',
    },
    card: {
        backgroundColor: '#1e293b', borderRadius: '12px', padding: '2rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)', textAlign: 'left',
    },
    heading: {
        fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '1.25rem',
        textAlign: 'center',
    },
    optionBtn: {
        display: 'block', width: '100%', padding: '0.85rem 1rem',
        marginBottom: '0.75rem', backgroundColor: '#334155', border: '1px solid #475569',
        borderRadius: '8px', fontSize: '0.95rem', cursor: 'pointer',
        textAlign: 'left', color: '#e2e8f0', transition: 'background 0.2s',
    },
    divider: {
        textAlign: 'center', color: '#64748b', fontSize: '0.8rem', margin: '1.25rem 0',
    },
    link: {
        display: 'block', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem',
        textDecoration: 'none',
    },
    backBtn: {
        background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
        fontSize: '0.85rem', marginBottom: '1rem', padding: '0',
    },
    label: {
        display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1',
        marginBottom: '0.5rem',
    },
    input: {
        width: '100%', padding: '0.75rem', border: '1px solid #475569', borderRadius: '8px',
        fontSize: '1rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box',
        backgroundColor: '#0f172a', color: '#f1f5f9',
    },
    hint: {
        fontSize: '0.75rem', color: '#64748b', marginTop: '-0.75rem', marginBottom: '1rem',
    },
    primaryBtn: {
        display: 'block', width: '100%', padding: '0.85rem', backgroundColor: '#10b981',
        color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem',
        fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem',
    },
    resendBtn: {
        display: 'block', width: '100%', background: 'none', border: 'none',
        color: '#10b981', cursor: 'pointer', fontSize: '0.85rem', marginTop: '1rem',
        textAlign: 'center',
    },
    infoText: {
        textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem',
    },
    error: {
        backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171',
        padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem',
    },
    footer: {
        textAlign: 'center', color: '#475569', fontSize: '0.75rem', marginTop: '2rem',
    },
};
