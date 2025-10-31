import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Building2, MapPin, Navigation, Phone, Clock3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { nepalGovForms, type GovForm } from '@/data/nepalGovForms';

export default function SmartSearch() {
  const [userLocation, setUserLocation] = useState<{ city: string; district: string; province: string } | null>(null);

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&accept-language=en`
            );
            const data = await response.json();
            
            setUserLocation({
              city: data.address.city || data.address.town || data.address.village || 'Unknown',
              district: data.address.state_district || data.address.county || 'Unknown',
              province: data.address.state || 'Unknown'
            });
          } catch (error) {
            console.error('Error fetching location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Find nearest office based on user location
  const findNearestOffice = (form: GovForm) => {
    if (!userLocation) return form.offices[0];
    
    // Try to match by city first
    let nearestOffice = form.offices.find(
      office => office.city.toLowerCase() === userLocation.city.toLowerCase()
    );
    
    // If no city match, try district
    if (!nearestOffice) {
      nearestOffice = form.offices.find(
        office => office.district.toLowerCase() === userLocation.district.toLowerCase()
      );
    }
    
    // If no district match, try province
    if (!nearestOffice) {
      nearestOffice = form.offices.find(
        office => office.province.toLowerCase() === userLocation.province.toLowerCase()
      );
    }
    
    return nearestOffice || form.offices[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Government Forms</h1>
          <p className="text-muted-foreground mb-4">सरकारी फारमहरू</p>
        </div>

        {/* Location Info */}
        {userLocation && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <MapPin className="h-4 w-4 text-primary" />
            <AlertDescription>
              Showing offices near <strong>{userLocation.city}, {userLocation.district}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* All Forms */}
        <div className="space-y-6">
          {nepalGovForms.map((form) => {
              const nearestOffice = findNearestOffice(form);
              return (
                <Card key={form.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <div>{form.name}</div>
                            <div className="text-sm font-normal text-muted-foreground mt-1">
                              {form.nameNepali}
                            </div>
                          </div>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {form.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {form.department}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {form.estimatedTime}
                      </Badge>
                      {form.fees && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Fees: {form.fees}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Required Documents */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="font-semibold text-sm mb-2">Required Documents:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {form.requiredDocuments.map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Nearest Office Info */}
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <Navigation className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-primary mb-1">
                            Nearest Office ({nearestOffice.district}):
                          </p>
                          <p className="text-sm font-medium">{nearestOffice.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {nearestOffice.city}, {nearestOffice.province}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {nearestOffice.contact && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{nearestOffice.contact}</span>
                          </div>
                        )}
                        {nearestOffice.timings && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock3 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">{nearestOffice.timings}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button asChild className="flex-1">
                        <a href={form.formUrl} target="_blank" rel="noopener noreferrer">
                          Open Official Portal
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to={`/form-filler?service=${encodeURIComponent(form.name)}`}>
                          Fill a Demo Form
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
      </div>
    </div>
  );
}

