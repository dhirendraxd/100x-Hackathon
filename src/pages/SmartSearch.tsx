import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Building2, MapPin, Navigation, Phone, Clock3, Home, Upload, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { validateDocumentEnhanced, formatFileSize, type EnhancedValidationResult } from '@/services/documentValidation';
import { nepalGovForms, type GovForm } from '@/data/nepalGovForms';

interface UploadedFile {
  file: File;
  validation?: EnhancedValidationResult;
  isValidating: boolean;
}

export default function SmartSearch() {
  const { user } = useAuthContext();
  const [userLocation, setUserLocation] = useState<{ city: string; district: string; province: string } | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile[]>>({});

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

  // Handle file upload with validation
  const handleFileUpload = async (formId: string, file: File) => {
    if (!user) {
      toast.warning('Please log in to save your documents', {
        description: 'Documents will only be stored temporarily until you log in.',
        duration: 5000,
      });
    }
    
    // Add file with validating state
    const uploadedFile: UploadedFile = {
      file,
      isValidating: true,
    };
    
    setUploadedDocs(prev => ({
      ...prev,
      [formId]: [...(prev[formId] || []), uploadedFile]
    }));
    
    toast.info(`Validating ${file.name}...`);
    
    // Perform validation
    try {
      const validation = await validateDocumentEnhanced(file);
      
      // Update file with validation results
      setUploadedDocs(prev => ({
        ...prev,
        [formId]: prev[formId].map(uf => 
          uf.file === file ? { ...uf, validation, isValidating: false } : uf
        )
      }));
      
      // Show validation results
      if (validation.valid) {
        toast.success(`${file.name} validated successfully!`, {
          description: validation.warnings.length > 0 
            ? `${validation.warnings.length} warning(s) found` 
            : 'Document meets all requirements'
        });
      } else {
        toast.error(`${file.name} validation failed`, {
          description: `${validation.errors.length} error(s) found`,
          duration: 7000,
        });
      }
      
      // Show warnings if any
      if (validation.warnings.length > 0 && validation.valid) {
        validation.warnings.forEach(warning => {
          toast.warning(warning, { duration: 5000 });
        });
      }
      
    } catch (error) {
      toast.error('Failed to validate document');
      setUploadedDocs(prev => ({
        ...prev,
        [formId]: prev[formId].filter(uf => uf.file !== file)
      }));
    }
  };

  // Remove uploaded file
  const removeFile = (formId: string, fileIndex: number) => {
    setUploadedDocs(prev => ({
      ...prev,
      [formId]: prev[formId].filter((_, idx) => idx !== fileIndex)
    }));
    toast.info('Document removed');
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Government Forms</h1>
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-center">सरकारी फारमहरू</p>
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

        {/* Login Warning for Documents */}
        {!user && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              <strong>Note:</strong> Documents uploaded will only be saved temporarily. 
              <Link to="/login" className="text-primary hover:underline font-medium ml-1">
                Log in
              </Link> to save your documents permanently.
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

                    {/* Document Upload Section */}
                    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-sm flex items-center gap-2">
                          <Upload className="h-4 w-4 text-blue-500" />
                          Upload Your Documents
                        </p>
                        {!user && (
                          <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                            Not Saved
                          </Badge>
                        )}
                      </div>
                      
                      {/* Upload Button */}
                      <div className="mb-3">
                        <input
                          type="file"
                          id={`file-upload-${form.id}`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(form.id, file);
                              e.target.value = ''; // Reset input
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => document.getElementById(`file-upload-${form.id}`)?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Files
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          PDF, JPG, PNG, DOC (Max 10MB)
                        </p>
                      </div>

                      {/* Uploaded Files List */}
                      {uploadedDocs[form.id] && uploadedDocs[form.id].length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Uploaded ({uploadedDocs[form.id].length}):
                          </p>
                          {uploadedDocs[form.id].map((uploadedFile, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-background p-2 rounded border"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {uploadedFile.isValidating ? (
                                  <>
                                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 animate-pulse" />
                                    <span className="text-xs truncate">{uploadedFile.file.name}</span>
                                    <span className="text-xs text-muted-foreground">Validating...</span>
                                  </>
                                ) : uploadedFile.validation ? (
                                  <>
                                    <FileText className={`h-4 w-4 flex-shrink-0 ${
                                      uploadedFile.validation.valid ? 'text-green-600' : 'text-red-600'
                                    }`} />
                                    <span className="text-xs truncate">{uploadedFile.file.name}</span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                      ({formatFileSize(uploadedFile.file.size)})
                                    </span>
                                    {uploadedFile.validation.valid ? (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        Valid
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                        {uploadedFile.validation.errors.length} Error(s)
                                      </Badge>
                                    )}
                                    {uploadedFile.validation.warnings.length > 0 && uploadedFile.validation.valid && (
                                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                        {uploadedFile.validation.warnings.length} Warning(s)
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="text-xs truncate">{uploadedFile.file.name}</span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                      ({formatFileSize(uploadedFile.file.size)})
                                    </span>
                                  </>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => removeFile(form.id, idx)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          {/* Show validation errors/warnings for each file */}
                          {uploadedDocs[form.id].map((uploadedFile, idx) => (
                            uploadedFile.validation && !uploadedFile.isValidating && (
                              <div key={`validation-${idx}`} className="space-y-1">
                                {uploadedFile.validation.errors.map((error, errIdx) => (
                                  <Alert key={`err-${errIdx}`} variant="destructive" className="py-2">
                                    <AlertDescription className="text-xs">
                                      <strong>{uploadedFile.file.name}:</strong> {error}
                                    </AlertDescription>
                                  </Alert>
                                ))}
                                {uploadedFile.validation.warnings.map((warning, warnIdx) => (
                                  <Alert key={`warn-${warnIdx}`} className="py-2 border-yellow-300 bg-yellow-50">
                                    <AlertDescription className="text-xs text-yellow-800">
                                      <strong>{uploadedFile.file.name}:</strong> {warning}
                                    </AlertDescription>
                                  </Alert>
                                ))}
                              </div>
                            )
                          ))}
                        </div>
                      )}
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

