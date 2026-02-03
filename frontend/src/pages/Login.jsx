import { useState, useEffect } from 'react';
import { SignIn } from "@clerk/clerk-react";

export default function Login() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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
            {/* Cursor Glow Effect */}
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

            <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, padding: '1rem' }}>
                {/* Logo Section */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', textAlign: 'center', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>CITYCYCLE</h1>
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <SignIn
                        signUpUrl="/signup"
                        appearance={{
                            variables: {
                                colorPrimary: '#10b981',
                                colorText: 'white',
                                colorTextSecondary: '#a1a1aa',
                                colorBackground: '#18181b', // Fallback
                                fontFamily: "'Outfit', sans-serif",
                            },
                            elements: {
                                card: {
                                    backgroundColor: 'rgba(24, 24, 27, 0.65)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                                },
                                headerTitle: { color: 'white' },
                                headerSubtitle: { color: '#a1a1aa' },
                                socialButtonsBlockButton: {
                                    backgroundColor: 'transparent',
                                    border: '1px solid #3f3f46',
                                    color: '#fafafa'
                                },
                                dividerLine: { backgroundColor: '#3f3f46' },
                                dividerText: { color: '#71717a' },
                                formFieldLabel: { color: '#fafafa' },
                                formFieldInput: {
                                    backgroundColor: '#27272a',
                                    border: '1px solid #3f3f46',
                                    color: 'white'
                                },
                                footerActionText: { color: '#71717a' },
                                footerActionLink: { color: '#10b981' },
                                formButtonPrimary: {
                                    backgroundColor: '#10b981',
                                    color: '#18181b',
                                    fontWeight: '600'
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </main>
    );
}
