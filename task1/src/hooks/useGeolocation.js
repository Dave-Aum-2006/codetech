import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    const success = (position) => {
      setCoordinates({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
      setLoading(false);
    };

    const handleError = (error) => {
      setError(error.message || 'Permission denied.');
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, handleError);
  }, []);

  return { coordinates, error, loading };
}
