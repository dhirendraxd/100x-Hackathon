import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FileText, Clock, Building2, MapPin, Navigation, Phone, Clock3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { nepalGovForms, type GovForm } from '@/data/nepalGovForms';


export default function SmartSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<GovForm[]>([]);
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

  // Search logic
  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    setQuery(searchQuery);
    
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().split(' ');
      const scored = nepalGovForms.map(form => {
        let score = 0;
        searchTerms.forEach(term => {
          if (form.name.toLowerCase().includes(term)) score += 10;
          if (form.nameNepali.includes(term)) score += 10;
          if (form.description.toLowerCase().includes(term)) score += 5;
          if (form.keywords.some(keyword => keyword.includes(term))) score += 3;
          if (form.department.toLowerCase().includes(term)) score += 2;
        });
        return { ...form, score };
      });
      
      const filtered = scored.filter(form => form.score > 0);
      filtered.sort((a, b) => b.score - a.score);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

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
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Government Form</h1>
          <p className="text-muted-foreground mb-4">सरकारी फारम खोज्नुहोस्</p>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="e.g., I want to apply for passport / राहदानी आवेदन"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg"
            />
            <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
              Search
            </Button>
          </form>
        </div>

        {/* Location Info */}
        {userLocation && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <MapPin className="h-4 w-4 text-primary" />
            <AlertDescription>
              Showing results for <strong>{userLocation.city}, {userLocation.district}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {results.length > 0 ? (
          <div className="space-y-6">
            <p className="text-muted-foreground">Found {results.length} form(s)</p>
            {results.map((form) => {
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
                        <Link to={`/form-viewer/${form.id}`}>
                          View Guide
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : query.trim() ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No forms found</p>
              <p className="text-muted-foreground mb-4">
                Try different keywords like "passport", "citizenship", "license", etc.
              </p>
              <p className="text-sm text-muted-foreground">
                राहदानी, नागरिकता, सवारी चालक जस्ता शब्दहरू प्रयोग गरी खोज्नुहोस्
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Start Your Search</p>
              <p className="text-muted-foreground">
                Tell us what form you're looking for and we'll help you find it
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

