"use client";

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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleFormSuccess = (message: string) => {
    setIsFormOpen(false);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000); // Hide after 5 seconds
  };

  return (
    <div className="relative h-screen w-screen bg-gray-100">
      <DynamicMap />
      {showAlert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md">
          <Alert className="bg-green-100 border-green-400 text-green-700">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="absolute top-4 right-4 z-50">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsFormOpen(true)}>Add Your Rent</Button>
          </DialogTrigger>
          <DialogContent className="w-11/12 max-w-sm md:max-w-2xl p-4 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Your Rent</DialogTitle>
              <DialogDescription>
                Share your rent details to help others make informed decisions.
              </DialogDescription>
            </DialogHeader>
            <RentForm onCancel={() => setIsFormOpen(false)} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
