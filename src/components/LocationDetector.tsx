import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LocationData {
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

const LocationDetector = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get location details
          // Using OpenStreetMap's Nominatim API (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'MitraSmart/1.0'
              }
            }
          );
          
          const data = await response.json();
          
          if (data && data.address) {
            const locationData: LocationData = {
              city: data.address.city || data.address.town || data.address.village || "Unknown",
              state: data.address.state || data.address.county || "Unknown",
              country: data.address.country || "Nepal",
              latitude,
              longitude,
            };
            
            setLocation(locationData);
          } else {
            // Fallback to basic location if API fails
            setLocation({
              city: "Location detected",
              state: "",
              country: "Nepal",
              latitude,
              longitude,
            });
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          // Fallback with coordinates only
          setLocation({
            city: "Location detected",
            state: "",
            country: "Nepal",
            latitude,
            longitude,
          });
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to detect location");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  if (error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="gap-2 cursor-pointer border-red-500/30 bg-red-500/10 text-red-400"
            >
              <MapPin className="h-3 w-3" />
              <span className="hidden sm:inline">Location unavailable</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enable location permissions to see your area</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-2 border-primary/30 bg-primary/10">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="hidden sm:inline">Detecting location...</span>
      </Badge>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="gap-2 cursor-pointer border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
            onClick={detectLocation}
          >
            <MapPin className="h-3 w-3 text-primary" />
            <span className="hidden sm:inline">
              {location.city}
              {location.state && `, ${location.state}`}
            </span>
            <span className="sm:hidden">Location</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-semibold">Your Location</p>
            <p>{location.city}, {location.state}</p>
            <p>{location.country}</p>
            <p className="text-muted-foreground mt-2">
              {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
            </p>
            <p className="text-muted-foreground text-[10px] mt-1">
              Click to refresh
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LocationDetector;
