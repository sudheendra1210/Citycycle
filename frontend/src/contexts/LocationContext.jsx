import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/locationService';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [coords, setCoords] = useState(null);
    const [areaName, setAreaName] = useState('Global View');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState('prompt'); // prompt, granted, denied

    const updateLocation = useCallback(async () => {
        setLoading(true);
        try {
            const userCoords = await locationService.getCurrentLocation();
            setCoords(userCoords);
            setPermissionStatus('granted');

            // Get human-readable area name
            const area = await locationService.reverseGeocode(userCoords.lat, userCoords.lng);
            setAreaName(area);
            setError(null);
        } catch (err) {
            console.warn("Location error:", err.message);
            setError(err.message);
            if (err.message.includes("denied")) {
                setPermissionStatus('denied');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        updateLocation();
    }, [updateLocation]);

    const value = {
        coords,
        areaName,
        loading,
        error,
        permissionStatus,
        refreshLocation: updateLocation
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
