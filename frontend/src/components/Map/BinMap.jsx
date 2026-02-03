import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
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
    else if (fillLevel >= 40) color = '#8b5cf6'; // purple (using purple to match app theme more closely)

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

const BinMap = ({ bins, center = [17.3850, 78.4867], zoom = 13 }) => {
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
                {/* Esri World Imagery - High quality satellite view */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />

                {/* Clearer, more minimal labels */}
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; Esri'
                    opacity={0.8}
                />

                <ZoomControl position="bottomright" />

                {bins && bins.map((bin) => (
                    <Marker
                        key={bin.bin_id}
                        position={[bin.latitude, bin.longitude]}
                        icon={getMarkerIcon(bin.fill_level || 0)}
                    >
                        <Popup className="dark-popup">
                            <div style={{ minWidth: '180px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    paddingBottom: '4px'
                                }}>
                                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{bin.bin_id}</h4>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: bin.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        color: bin.status === 'active' ? '#10b981' : '#f59e0b',
                                        textTransform: 'uppercase',
                                        fontWeight: 800
                                    }}>
                                        {bin.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                        <span style={{ color: '#9ca3af' }}>Fill Level</span>
                                        <span style={{
                                            color: bin.fill_level >= 80 ? '#ef4444' : '#10b981',
                                            fontWeight: 700
                                        }}>{Math.round(bin.fill_level || 0)}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                        <span style={{ color: '#9ca3af' }}>Type</span>
                                        <span style={{ color: '#e5e7eb' }}>{bin.bin_type}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                        <span style={{ color: '#9ca3af' }}>Capacity</span>
                                        <span style={{ color: '#e5e7eb' }}>{bin.capacity_liters}L</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                        <span style={{ color: '#9ca3af' }}>Zone</span>
                                        <span style={{ color: '#e5e7eb' }}>{bin.zone}</span>
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
