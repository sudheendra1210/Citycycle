/**
 * Location Service
 * Handles browser geolocation and permission state
 */

export const locationService = {
    /**
     * Get current user coordinates
     * @returns {Promise<{lat: number, lng: number}>}
     */
    getCurrentLocation: () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    let message = "An unknown error occurred";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = "User denied the request for Geolocation";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = "Location information is unavailable";
                            break;
                        case error.TIMEOUT:
                            message = "The request to get user location timed out";
                            break;
                    }
                    reject(new Error(message));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    },

    /**
     * Reverse geocode coordinates to area name
     * @param {number} lat 
     * @param {number} lng 
     * @returns {Promise<string>}
     */
    reverseGeocode: async (lat, lng) => {
        try {
            // Using OpenStreetMap Nominatim for free reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en-US,en;q=0.9',
                        'User-Agent': 'SmartWasteManagement/1.0'
                    }
                }
            );

            if (!response.ok) throw new Error("Failed to fetch address");

            const data = await response.json();

            // Extract the most relevant locality name
            // address.suburb, address.neighbourhood, address.city_district, or address.city
            const addr = data.address;
            const locality = addr.suburb ||
                addr.neighbourhood ||
                addr.city_district ||
                addr.residential ||
                addr.village ||
                addr.county ||
                addr.city ||
                "Unknown Area";

            return locality;
        } catch (error) {
            console.error("Reverse geocoding error:", error);
            return "Local Area"; // Fallback
        }
    }
};

export default locationService;
