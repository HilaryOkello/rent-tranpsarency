'use client';

import { useState } from 'react';
import DynamicMap from '@/components/map/DynamicMap';
import RentForm from '@/components/rent-form/RentForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LatLng } from 'leaflet';

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);
  const [selectedLocationAddress, setSelectedLocationAddress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.286389, 36.817223]);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isConfirmLocationOpen, setIsConfirmLocationOpen] = useState(false);
  const [tempSelectedPosition, setTempSelectedPosition] = useState<LatLng | null>(null);
  const [tempSelectedLocationAddress, setTempSelectedLocationAddress] = useState<string | null>(null);

  

  const handleFormSuccess = (message: string) => {
    setIsFormOpen(false);
    setAlertMessage(message);
    setShowAlert(true);
    setSelectedPosition(null);
    setIsSelectingLocation(false);
    setTempSelectedPosition(null);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedPosition(null);
    setSelectedLocationAddress(null);
    setIsSelectingLocation(false);
    setTempSelectedPosition(null);
    setTempSelectedLocationAddress(null);
    setIsConfirmLocationOpen(false);
  };

  const handleMapClick = async (latLng: LatLng) => {
    if (isSelectingLocation) {
      setTempSelectedPosition(latLng);
      // Start fetching address immediately
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng.lat}&lon=${latLng.lng}`
        );
        const data = await response.json();
        if (data.display_name) {
          setTempSelectedLocationAddress(data.display_name);
        } else {
          setTempSelectedLocationAddress('Unknown location');
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        setTempSelectedLocationAddress('Could not retrieve address');
      } finally {
        setIsConfirmLocationOpen(true);
      }
    }
  };

  const confirmLocation = () => {
    setSelectedPosition(tempSelectedPosition);
    setSelectedLocationAddress(tempSelectedLocationAddress); // Transfer address
    setIsFormOpen(true);
    setIsConfirmLocationOpen(false);
    setIsSelectingLocation(false);
  };

  const reselectLocation = () => {
    setTempSelectedPosition(null);
    setIsConfirmLocationOpen(false);
    // Keep isSelectingLocation true to allow re-selection
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        setMapZoom(15);
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  const startLocationSelection = () => {
    setIsSelectingLocation(true);
  };

  const cancelLocationSelection = () => {
    setIsSelectingLocation(false);
  };

  return (
    <TooltipProvider>
      <div className="relative h-screen w-screen bg-gray-100">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-2xl flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
          </div>
          <div className="flex-shrink-0">
            {!isSelectingLocation ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={startLocationSelection} className="w-full">Add Your Rent</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to add a new rent entry</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button onClick={cancelLocationSelection} variant="neutral">Cancel</Button>
            )}
          </div>
        </div>

        {isSelectingLocation && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-2xl bg-white p-2 rounded-md shadow-md text-center">
            <p className="font-bold">Click on the map to select a location.</p>
          </div>
        )}

        <DynamicMap 
          onMapClick={handleMapClick} 
          selectedPosition={isSelectingLocation ? tempSelectedPosition : selectedPosition} 
          center={mapCenter} 
          zoom={mapZoom} 
          selectedLocationAddress={isSelectingLocation ? tempSelectedLocationAddress : selectedLocationAddress}
        />

        {showAlert && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md">
            <Alert>
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) handleFormCancel();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Your Rent</DialogTitle>
              <DialogDescription>
                Share your rent details to help others make informed decisions.
              </DialogDescription>
            </DialogHeader>
            <RentForm
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
              initialPosition={selectedPosition}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isConfirmLocationOpen} onOpenChange={(open) => {
          setIsConfirmLocationOpen(open);
          if (!open) reselectLocation(); // Use reselectLocation to clear temp state
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Location</DialogTitle>
              <DialogDescription>
                Do you want to use this location for your rent entry?
              </DialogDescription>
            </DialogHeader>
            {tempSelectedLocationAddress && (
              <p className="text-sm text-gray-600">Selected: {tempSelectedLocationAddress}</p>
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="neutral" onClick={reselectLocation}>Reselect Location</Button>
              <Button onClick={confirmLocation}>Confirm Location</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}


