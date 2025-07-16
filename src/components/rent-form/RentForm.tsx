import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RentFormProps {
  onCancel: () => void;
  onSuccess: (message: string) => void;
}

const RentForm: React.FC<RentFormProps> = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    estate: '',
    apartment: '',
    rent: '',
    bedrooms: '',
    propertyType: '',
    furnished: false,
    comment: '',
    latitude: '',
    longitude: '',
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error'>('error'); // Only for errors

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowAlert(false); // Hide previous alerts

    try {
      const dataToSend = {
        ...formData,
        rent: parseInt(formData.rent),
        bedrooms: parseInt(formData.bedrooms),
        latitude: parseFloat(formData.latitude || '0'),
        longitude: parseFloat(formData.longitude || '0'),
      };

      const response = await fetch('/api/rents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        onSuccess('Rent entry submitted successfully!');
        setFormData({
          estate: '',
          apartment: '',
          rent: '',
          bedrooms: '',
          propertyType: '',
          furnished: false,
          comment: '',
          latitude: '',
          longitude: '',
        });
      } else {
        const errorData = await response.json();
        setAlertMessage(`Error: ${errorData.error || 'Failed to submit rent entry'}`);
        setAlertType('error');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
      setAlertType('error');
      setShowAlert(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md shadow-md">
      {showAlert && (
        <Alert className="bg-red-100 border-red-400 text-red-700">
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="propertyType">Property Type</Label>
        <Select onValueChange={(value) => {
          handleSelectChange('propertyType', value);
          if (value === 'STUDIO' || value === 'SINGLE_ROOM') {
            setFormData((prev) => ({ ...prev, bedrooms: '0' }));
          }
        }} value={formData.propertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Select a property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="APARTMENT">Apartment</SelectItem>
            <SelectItem value="BUNGALOW">Bungalow</SelectItem>
            <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
            <SelectItem value="MAISONETTE">Maisonette</SelectItem>
            <SelectItem value="STUDIO">Studio</SelectItem>
            <SelectItem value="SINGLE_ROOM">Single Room</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="estate">Estate/Area Name</Label>
        <Input id="estate" value={formData.estate} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="apartment">Apartment Name (optional)</Label>
        <Input id="apartment" value={formData.apartment} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="rent">Rent Amount (KES)</Label>
        <Input id="rent" type="number" value={formData.rent} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="bedrooms">Number of Bedrooms</Label>
        <Input
          id="bedrooms"
          type="number"
          value={formData.bedrooms}
          onChange={handleChange}
          required
          disabled={formData.propertyType === 'STUDIO' || formData.propertyType === 'SINGLE_ROOM'}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="furnished" checked={formData.furnished} onCheckedChange={(checked: boolean) => handleCheckboxChange('furnished', checked)} />
        <Label htmlFor="furnished">Furnished</Label>
      </div>
      <div>
        <Label htmlFor="comment">Optional Comment</Label>
        <Textarea id="comment" value={formData.comment} onChange={handleChange} />
      </div>
      {/* TODO: Add map-based location picker */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="neutral" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Submit Rent</Button>
      </div>
    </form>
  );
};

export default RentForm;
