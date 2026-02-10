import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';

// Helper component to change map view dynamically
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Minimalist marker icon based on fill level
const getMarkerIcon = (fillLevel) => {
    let color = '#10b981'; // green
    if (fillLevel >= 80) color = '#ef4444'; // red
    else if (fillLevel >= 60) color = '#f59e0b'; // orange
    else if (fillLevel >= 40) color = '#8b5cf6'; // purple

    return L.divIcon({
        className: 'minimal-marker',
        html: `
      <div class="minimal-marker-inner" style="
        background-color: ${color};
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 10px ${color}88, 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
};

const BinMap = ({ bins, route = null, center = [17.3850, 78.4867], zoom = 13 }) => {
    // Extract coordinates for the route line
    const routePositions = route?.optimized_sequence?.map(point => [point.latitude, point.longitude]) || [];

    return (
        <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '0.75rem',
            height: '100%',
            overflow: 'hidden',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            position: 'relative'
        }}>
            <MapContainer
                center={center}
                zoom={zoom}
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <ChangeView center={center} zoom={zoom} />
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; Esri'
                />
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; Esri'
                    opacity={0.8}
                />

                <ZoomControl position="bottomright" />

                {/* Render Optimized Route */}
                {routePositions.length > 0 && (
                    <Polyline
                        positions={routePositions}
                        pathOptions={{
                            color: '#06b6d4',
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '10, 10',
                            lineJoin: 'round'
                        }}
                    />
                )}

                {bins && bins.map((bin) => (
                    <Marker
                        key={bin.bin_id}
                        position={[bin.latitude, bin.longitude]}
                        icon={getMarkerIcon(bin.fill_level || 0)}
                    >
                        <Popup className="dark-popup">
                            <div style={{ minWidth: '200px', padding: '4px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '10px',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    paddingBottom: '6px'
                                }}>
                                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{bin.bin_id}</h4>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        padding: '2px 8px',
                                        borderRadius: '99px',
                                        backgroundColor: bin.fill_level >= 80 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                        color: bin.fill_level >= 80 ? '#ef4444' : '#10b981',
                                        textTransform: 'uppercase',
                                        fontWeight: 800,
                                        letterSpacing: '0.05em'
                                    }}>
                                        {bin.fill_level >= 80 ? 'Critical' : 'Normal'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Current Fill</span>
                                        <span style={{
                                            color: bin.fill_level >= 80 ? '#ef4444' : '#10b981',
                                            fontWeight: 800,
                                            fontSize: '0.9rem'
                                        }}>{Math.round(bin.fill_level || 0)}%</span>
                                    </div>
                                    {bin.hours_until_full !== undefined && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Est. Overflow</span>
                                            <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: '0.8rem' }}>
                                                {bin.hours_until_full <= 0 ? 'Full' : `~${Math.round(bin.hours_until_full)}h`}
                                            </span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>{bin.zone} • {bin.bin_type}</span>
                                        <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>{bin.capacity_liters}L</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default BinMap;
