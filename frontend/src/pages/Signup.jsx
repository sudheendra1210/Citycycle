import { useState } from 'react';
import { SignUp } from "@clerk/clerk-react";

export default function Signup() {
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
            <div style={{ width: '100%', maxWidth: '480px' }}>
                {/* Logo and Brand */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg
                                style={{ width: '1.25rem', height: '1.25rem', color: 'white' }}
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '-0.02em' }}>CITYCYCLE</span>
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '600', color: 'white', margin: '0 0 0.5rem 0' }}>Create Account</h1>
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <SignUp
                        signInUrl="/login"
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
};


