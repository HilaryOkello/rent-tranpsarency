import dynamic from 'next/dynamic';
import { LatLng } from 'leaflet';

interface MapProps {
  onMapClick: (latLng: LatLng) => void;
  selectedPosition: LatLng | null;
  center: [number, number];
  zoom: number;
}

const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
}) as React.ComponentType<MapProps>;

export default DynamicMap;


