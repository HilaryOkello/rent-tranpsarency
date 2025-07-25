import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LatLng } from 'leaflet';

interface RentFormProps {
  onCancel: () => void;
  onSuccess: (message: string) => void;
  initialPosition: LatLng | null;
}

interface FormData {
  estate: string;
  apartment?: string;
  rent?: number;
  bedrooms?: number;
  propertyType?: string;
  furnished: boolean;
  comment?: string;
  latitude: number;
  longitude: number;
}

const RentForm: React.FC<RentFormProps> = ({ onCancel, onSuccess, initialPosition }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [locationAddress, setLocationAddress] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      estate: '',
      apartment: '',
      rent: undefined,
      bedrooms: undefined,
      propertyType: '',
      furnished: false,
      comment: '',
      latitude: initialPosition?.lat || 0,
      longitude: initialPosition?.lng || 0,
    },
  });

  const propertyType = form.watch('propertyType');

  useEffect(() => {
    if (initialPosition) {
      form.setValue('latitude', initialPosition.lat);
      form.setValue('longitude', initialPosition.lng);

      const fetchAddress = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${initialPosition.lat}&lon=${initialPosition.lng}`
          );
          const data = await response.json();
          if (data.display_name) {
            setLocationAddress(data.display_name);
          } else {
            setLocationAddress('Unknown location');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          setLocationAddress('Could not retrieve address');
        }
      };
      fetchAddress();
    } else {
      setLocationAddress(null);
    }
  }, [initialPosition, form]);

  useEffect(() => {
    if (propertyType === 'STUDIO' || propertyType === 'SINGLE_ROOM') {
      form.setValue('bedrooms', 0);
      form.clearErrors('bedrooms');
    }
  }, [propertyType, form]);

  const onSubmit = async (values: FormData) => {
    setShowAlert(false);
    
    // Basic validation
    if (!values.estate.trim()) {
      setAlertMessage('Estate is required');
      setShowAlert(true);
      return;
    }

    try {
      const response = await fetch('/api/rents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        onSuccess('Rent entry submitted successfully!');
        form.reset();
      } else {
        const errorData = await response.json();
        setAlertMessage(`Error: ${errorData.error || 'Failed to submit rent entry'}`);
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
      setShowAlert(true);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        {showAlert && (
          <Alert>
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
        {locationAddress && (
          <Alert>
            <AlertTitle>Location Selected:</AlertTitle>
            <AlertDescription>{locationAddress}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="BUNGALOW">Bungalow</SelectItem>
                  <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                  <SelectItem value="MAISONETTE">Maisonette</SelectItem>
                  <SelectItem value="STUDIO">Studio</SelectItem>
                  <SelectItem value="SINGLE_ROOM">Single Room</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estate/Area Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apartment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apartment Name (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rent Amount (KES)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : Number(value));
                  }}
                  value={field.value === undefined ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Bedrooms</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : Number(value));
                  }}
                  value={field.value === undefined ? '' : field.value}
                  disabled={propertyType === 'STUDIO' || propertyType === 'SINGLE_ROOM'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="furnished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Furnished</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Optional Comment</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="neutral" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Submit Rent</Button>
        </div>
      </form>
    </Form>
  );
};

export default RentForm;