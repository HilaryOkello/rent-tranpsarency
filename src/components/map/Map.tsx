import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { LatLng } from 'leaflet';

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

const Map = ({ onMapClick, selectedPosition, center, zoom }: MapProps) => {
  const [rentData, setRentData] = useState<RentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onMapClick={onMapClick} />
      {selectedPosition && <Marker position={selectedPosition} />}
      {rentData.map((entry) => (
        <Marker key={entry.id} position={[entry.latitude, entry.longitude]}>
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


