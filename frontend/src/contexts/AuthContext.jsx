import React, { createContext, useContext } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut, openSignIn, openSignUp } = useClerk();

    // Adapter to match previous Supabase user structure where possible
    const adaptedUser = user ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        user_metadata: user.publicMetadata,
        fullName: user.fullName,
        avatarUrl: user.imageUrl,
    } : null;

    const value = {
        user: adaptedUser,
        loading: !isLoaded,
        isAuthenticated: isSignedIn,
        signOut: async () => await signOut(),
        // These open the Clerk modals/pages
        signIn: () => openSignIn(),
        signUp: () => openSignUp(),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
