import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { LatLng } from 'leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Custom icon for selected position
const greenIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(renderToString(
    <MapPin size={48} color="#16a34a" fill="#16a34a" />
  )),
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

// Custom icon for rent entries
const rentEntryIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
      <path fill="#16a34a" d="M12 0C7.58 0 4 3.58 4 8c0 7 8 16 8 16s8-9 8-16c0-4.42-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface RentEntry {
  id: string;
  rent: number;
  bedrooms: number;
  latitude: number;
  longitude: number;
  estate: string;
  propertyType: string;
}

interface MapProps {
  onMapClick: (latLng: LatLng) => void;
  selectedPosition: LatLng | null;
  center: [number, number];
  zoom: number;
  selectedLocationAddress: string | null;
}

const MapEvents = ({ onMapClick }: { onMapClick: (latLng: LatLng) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const Map = ({ onMapClick, selectedPosition, center, zoom, selectedLocationAddress }: MapProps) => {
  const [rentData, setRentData] = useState<RentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (selectedPosition && selectedLocationAddress) {
      setShowConfirmation(false); // Hide immediately on new selection
      const timer = setTimeout(() => {
        setShowConfirmation(true);
      }, 700); // Increased delay to 700ms
      return () => clearTimeout(timer); // Clean up the timer
    } else {
      setShowConfirmation(false);
    }
  }, [selectedPosition, selectedLocationAddress]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/rents');
        if (!response.ok) {
          throw new Error('Failed to fetch rent data');
        }
        const data = await response.json();
        setRentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading Map...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
  }

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onMapClick={onMapClick} />
      {selectedPosition && (
        <Marker position={selectedPosition} icon={greenIcon}>
          {showConfirmation && (
            <Popup offset={[0, -50]}>
              Location Selected!
              {selectedLocationAddress && <p>{selectedLocationAddress}</p>}
            </Popup>
          )}
        </Marker>
      )}
      {rentData.map((entry) => (
        <Marker key={entry.id} position={[entry.latitude, entry.longitude]} icon={rentEntryIcon}>
          <Popup>
            <div className="font-mono">
              <h3 className="font-bold">{entry.estate}</h3>
              <p>Property Type: {entry.propertyType}</p>
              <p>Rent: KES {entry.rent.toLocaleString()}</p>
              <p>Bedrooms: {entry.bedrooms}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;


