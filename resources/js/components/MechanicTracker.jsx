import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const MechanicTracker = ({ bookingId, isTracking, onLocationUpdate }) => {
    const watchId = useRef(null);
    const lastUpdate = useRef(0);

    useEffect(() => {
        if (isTracking && "geolocation" in navigator) {
            watchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const now = Date.now();
                    
                    // Throttle updates to once every 10 seconds to save battery/bandwidth
                    if (now - lastUpdate.current > 10000) {
                        updateLocation(latitude, longitude);
                        lastUpdate.current = now;
                    }
                },
                (error) => console.error("Tracking error:", error),
                { enableHighAccuracy: true, maximumAge: 10000 }
            );
        } else {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        }

        return () => {
            if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
        };
    }, [isTracking, bookingId]);

    const updateLocation = async (lat, lng) => {
        try {
            await axios.put(`/api/bookings/${bookingId}/mechanic-location`, {
                location: `${lat},${lng}`
            });
            if (onLocationUpdate) onLocationUpdate(lat, lng);
        } catch (err) {
            console.error("Failed to update mechanic location:", err);
        }
    };

    if (!isTracking) return null;

    return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Live Tracking Aktif</span>
        </div>
    );
};

export default MechanicTracker;
