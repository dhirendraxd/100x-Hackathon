import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Building2, MapPin, Navigation, Phone, Clock3, Home, Upload, X, AlertCircle, CheckCircle, AlertTriangle, Sparkles, Brain, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { validateDocumentEnhanced, formatFileSize, type EnhancedValidationResult } from '@/services/documentValidation';
import { nepalGovForms, type GovForm } from '@/data/nepalGovForms';
import { saveUploadedFile } from '@/services/userProfileService';
import { useTranslation } from 'react-i18next';

interface AIInsight {
  status: 'processing' | 'complete';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  confidence: number;
  suggestions: string[];
  documentType?: string;
}

interface UploadedFile {
  file: File;
  validation?: EnhancedValidationResult;
  isValidating: boolean;
  aiInsight?: AIInsight;
  documentType?: string; // Which required document this file is for
  savedToProfile?: boolean; // Whether this file is saved to user profile
}

export default function SmartSearch() {
  const { t } = useTranslation('common');
  const { user } = useAuthContext();
  const [userLocation, setUserLocation] = useState<{ city: string; district: string; province: string } | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile[]>>({});
  const [showUploadFields, setShowUploadFields] = useState<Record<string, boolean>>({});
  const [savingToProfile, setSavingToProfile] = useState<Record<string, boolean>>({});

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

  // Generate dummy AI insights with specific actionable advice
  const generateAIInsight = (file: File): AIInsight => {
    const fileType = file.type;
    const fileSize = file.size;
    const fileName = file.name.toLowerCase();
    
    // Simulate AI analysis based on file characteristics
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';
    
    const qualities: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair', 'poor'];
    const quality = fileSize > 500000 ? qualities[Math.floor(Math.random() * 2)] : qualities[2 + Math.floor(Math.random() * 2)];
    
    const confidence = quality === 'excellent' ? 95 + Math.random() * 5 :
                      quality === 'good' ? 80 + Math.random() * 15 :
                      quality === 'fair' ? 60 + Math.random() * 20 :
                      40 + Math.random() * 20;
    
    const suggestions: string[] = [];
    const documentTypes = ['Citizenship Certificate', 'Passport Photo', 'Birth Certificate', 'Address Proof'];
    
    // Simulate random issues for demonstration
    const simulatedIssues = {
      brightness: Math.random(),
      resolution: Math.random(),
      cropping: Math.random(),
      blur: Math.random(),
      background: Math.random(),
    };
    
    if (quality === 'excellent') {
      suggestions.push('✓ Document quality is optimal for submission');
      suggestions.push('✓ All text and details are clearly visible');
      if (isImage) {
        suggestions.push('✓ Photo meets biometric standards');
        suggestions.push('✓ Proper lighting and contrast detected');
      } else {
        suggestions.push('✓ Document is properly scanned and readable');
      }
    } else if (quality === 'good') {
      suggestions.push('✓ Document is acceptable for submission');
      
      if (fileSize < 200000) {
        suggestions.push('⚠ Resolution could be improved');
        suggestions.push('💡 Try: Scan at 300 DPI or higher for better clarity');
      }
      
      if (isImage && simulatedIssues.background > 0.6) {
        suggestions.push('⚠ Background could be more neutral');
        suggestions.push('💡 Tip: Use a plain white or light-colored background');
      }
    } else if (quality === 'fair') {
      suggestions.push('⚠ Document quality is below recommended standards');
      
      if (simulatedIssues.brightness < 0.4) {
        suggestions.push('❌ Image appears too dark (low light detected)');
        suggestions.push('💡 Fix: Retake photo in well-lit area or increase brightness');
        suggestions.push('💡 Tip: Use natural daylight or ensure adequate indoor lighting');
      } else if (simulatedIssues.brightness > 0.7) {
        suggestions.push('❌ Image appears overexposed (too bright)');
        suggestions.push('💡 Fix: Reduce flash intensity or avoid direct sunlight');
        suggestions.push('💡 Tip: Take photo in evenly lit area without harsh shadows');
      }
      
      if (isImage && simulatedIssues.cropping > 0.6) {
        suggestions.push('❌ Photo appears cropped or edges are cut off');
        suggestions.push('💡 Fix: Ensure entire document is visible within frame');
        suggestions.push('💡 Tip: Leave small margin around document edges');
      }
      
      if (simulatedIssues.blur > 0.6) {
        suggestions.push('❌ Image appears blurry or out of focus');
        suggestions.push('💡 Fix: Hold camera steady and tap to focus before capturing');
        suggestions.push('💡 Tip: Clean camera lens and use stable surface if needed');
      }
      
      if (simulatedIssues.resolution > 0.7) {
        suggestions.push('⚠ Resolution is below optimal standards');
        suggestions.push('💡 Fix: Use scanner at 300-600 DPI or higher quality camera');
      }
      
    } else {
      suggestions.push('✗ Quality too low - document will likely be rejected');
      
      if (fileSize < 50000) {
        suggestions.push('❌ File size too small - indicates very low resolution');
        suggestions.push('💡 Fix: Use higher quality camera or scanner settings');
        suggestions.push('💡 Required: Minimum 600x600 pixels for photos');
      }
      
      if (simulatedIssues.brightness < 0.3) {
        suggestions.push('❌ Severe lighting issue - document is too dark');
        suggestions.push('💡 Fix: Retake in bright, well-lit environment');
        suggestions.push('💡 Use: Flash or external lighting if indoors');
      }
      
      if (isImage) {
        if (simulatedIssues.cropping > 0.7) {
          suggestions.push('❌ Major portion of document is cut off');
          suggestions.push('💡 Fix: Center document in frame with all edges visible');
          suggestions.push('💡 Tip: Use grid lines on camera to align properly');
        }
        
        if (simulatedIssues.blur > 0.7) {
          suggestions.push('❌ Extremely blurry - text is unreadable');
          suggestions.push('💡 Fix: Use tripod or steady surface to avoid camera shake');
          suggestions.push('💡 Tip: Use autofocus and ensure good lighting');
        }
        
        if (simulatedIssues.background > 0.8) {
          suggestions.push('❌ Busy or dark background affects document visibility');
          suggestions.push('💡 Fix: Place document on plain white or light surface');
          suggestions.push('💡 Tip: Avoid patterned backgrounds or dark surfaces');
        }
      } else {
        suggestions.push('❌ Scan quality is insufficient for verification');
        suggestions.push('💡 Fix: Re-scan at higher resolution (minimum 300 DPI)');
        suggestions.push('💡 Tip: Ensure scanner glass is clean and document is flat');
      }
      
      suggestions.push('⚠ Please upload a new document with better quality');
    }
    
    return {
      status: 'complete',
      quality,
      confidence: Math.round(confidence),
      suggestions,
      documentType: isImage ? documentTypes[Math.floor(Math.random() * documentTypes.length)] : 'Supporting Document'
    };
  };

  // Handle file upload with validation and AI insights
  const handleFileUpload = async (formId: string, file: File, documentName: string) => {
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
      documentType: documentName,
      savedToProfile: false,
    };
    
    setUploadedDocs(prev => ({
      ...prev,
      [formId]: [...(prev[formId] || []), uploadedFile]
    }));
    
    toast.info(`Analyzing ${documentName}...`, {
      icon: <Brain className="h-4 w-4" />
    });
    
    // Perform validation
    try {
      const validation = await validateDocumentEnhanced(file);
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate AI insights
      const aiInsight = generateAIInsight(file);
      
      // Update file with validation results and AI insights
      setUploadedDocs(prev => ({
        ...prev,
        [formId]: prev[formId].map(uf => 
          uf.file === file ? { ...uf, validation, isValidating: false, aiInsight } : uf
        )
      }));
      
      // Show validation results
      if (validation.valid) {
        toast.success(`AI Analysis Complete`, {
          description: `${aiInsight.documentType} - ${aiInsight.quality.toUpperCase()} quality (${aiInsight.confidence}% confidence)`,
          icon: <Sparkles className="h-4 w-4" />
        });
      } else {
        toast.error(`${file.name} validation failed`, {
          description: `${validation.errors.length} error(s) found`,
          duration: 7000,
        });
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Document analysis error:', errorMsg);
      toast.error('Failed to analyze document', {
        description: errorMsg,
        duration: 5000,
      });
      setUploadedDocs(prev => ({
        ...prev,
        [formId]: prev[formId].filter(uf => uf.file !== file)
      }));
    }
  };

  // Save documents to user profile
  const saveDocumentsToProfile = async (formId: string) => {
    if (!user) {
      toast.error('Please log in to save documents');
      return;
    }

    const documents = uploadedDocs[formId];
    if (!documents || documents.length === 0) {
      toast.warning('No documents to save');
      return;
    }

    setSavingToProfile(prev => ({ ...prev, [formId]: true }));

    try {
      // Simulate saving files (in production, you'd upload to Firebase Storage)
      for (const doc of documents) {
        if (doc.aiInsight && doc.documentType) {
          // Create a simulated file URL (in production, upload to Storage first)
          const fileUrl = `temp://${user.uid}/${doc.documentType}/${doc.file.name}`;
          
          await saveUploadedFile(user.uid, doc.documentType, {
            fileName: doc.file.name,
            fileUrl: fileUrl,
            uploadDate: new Date().toISOString(),
            fileSize: doc.file.size,
            aiVerification: {
              quality: doc.aiInsight.quality,
              confidence: doc.aiInsight.confidence,
              verifiedDate: new Date().toISOString(),
            },
          });
        }
      }

      // Mark all documents as saved
      setUploadedDocs(prev => ({
        ...prev,
        [formId]: prev[formId].map(uf => ({ ...uf, savedToProfile: true }))
      }));

      toast.success('Documents saved to your profile!', {
        description: 'You can now use autofill for similar forms',
        icon: <Save className="h-4 w-4" />,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error saving documents:', error);
      toast.error('Failed to save documents to profile');
    } finally {
      setSavingToProfile(prev => ({ ...prev, [formId]: false }));
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
            <h1 className="text-3xl font-bold">{t('pages.smart.header', { defaultValue: 'Government Forms' })}</h1>
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                {t('nav.home')}
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-center">{t('pages.smart.subheader', { defaultValue: 'सरकारी फारमहरू' })}</p>
        </div>

        {/* Location Info */}
        {userLocation && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <MapPin className="h-4 w-4 text-primary" />
            <AlertDescription>
              {t('pages.smart.showingOfficesNear', { defaultValue: 'Showing offices near' })} <strong>{userLocation.city}, {userLocation.district}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Login Warning for Documents */}
        {!user && (
          <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              <strong>{t('pages.smart.note', { defaultValue: 'Note:' })}</strong> {t('pages.smart.tempSave', { defaultValue: 'Documents uploaded will only be saved temporarily.' })} 
              <Link to="/login" className="text-primary hover:underline font-medium ml-1">
                {t('cta.login')}
              </Link> {t('pages.smart.savePermanently', { defaultValue: 'to save your documents permanently.' })}
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
                      <p className="font-semibold text-sm mb-2">{t('pages.smart.requiredDocs', { defaultValue: 'Required Documents:' })}</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {form.requiredDocuments.map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Document Upload Section - Compact */}
                    <div className="border border-primary/20 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Upload className="h-4 w-4 text-primary" />
                          {t('pages.smart.uploadDocuments', { defaultValue: 'Upload Documents' })}
                        </p>
                        {!user && (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                            {t('pages.smart.guestMode', { defaultValue: 'Guest Mode' })}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Initial Upload Button */}
                      {!showUploadFields[form.id] ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-9 text-sm"
                          onClick={() => setShowUploadFields(prev => ({ ...prev, [form.id]: true }))}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {t('pages.smart.chooseFiles', { defaultValue: 'Choose Files to Upload' })}
                        </Button>
                      ) : (
                        <>
                          {/* Individual Document Upload Fields */}
                          <div className="space-y-3 pt-2">
                            <p className="text-xs text-muted-foreground font-medium">
                              {t('pages.smart.uploadBelow', { defaultValue: 'Upload required documents below:' })}
                            </p>
                            {form.requiredDocuments.map((doc, docIdx) => (
                              <div key={docIdx} className="space-y-1.5">
                                <label className="text-xs font-medium text-foreground flex items-center gap-1">
                                  <span className="text-primary">•</span>
                                  {doc}
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="file"
                                    id={`file-upload-${form.id}-${docIdx}`}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleFileUpload(form.id, file, doc);
                                        e.target.value = '';
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-xs justify-start"
                                    onClick={() => document.getElementById(`file-upload-${form.id}-${docIdx}`)?.click()}
                                  >
                                    <Upload className="h-3 w-3 mr-2" />
                                    <span className="truncate">{t('pages.smart.chooseFile', { defaultValue: 'Choose File (PDF/JPG/PNG)' })}</span>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Uploaded Files List - Compact */}
                      {uploadedDocs[form.id] && uploadedDocs[form.id].length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          <p className="text-xs font-medium text-muted-foreground">
                            {t('pages.smart.uploadedFiles', { defaultValue: 'Uploaded Files' })} ({uploadedDocs[form.id].length}):
                          </p>
                          {uploadedDocs[form.id].map((uploadedFile, idx) => (
                            <div key={idx} className="space-y-2">
                              {/* File Info Row */}
                              <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {uploadedFile.isValidating ? (
                                    <>
                                      <Brain className="h-4 w-4 text-primary animate-pulse flex-shrink-0" />
                                      <span className="text-xs truncate">{t('pages.smart.analyzing', { defaultValue: 'Analyzing...' })}</span>
                                    </>
                                  ) : (
                                    <>
                                      <FileText className={`h-4 w-4 flex-shrink-0 ${
                                        uploadedFile.aiInsight?.quality === 'excellent' ? 'text-green-600' :
                                        uploadedFile.aiInsight?.quality === 'good' ? 'text-blue-600' :
                                        uploadedFile.aiInsight?.quality === 'fair' ? 'text-yellow-600' :
                                        'text-red-600'
                                      }`} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs truncate font-medium">{uploadedFile.file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatFileSize(uploadedFile.file.size)}
                                        </p>
                                      </div>
                                      {uploadedFile.aiInsight && (
                                        <Badge variant="outline" className={`text-xs ${
                                          uploadedFile.aiInsight.quality === 'excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                                          uploadedFile.aiInsight.quality === 'good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                          uploadedFile.aiInsight.quality === 'fair' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                          'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                          {uploadedFile.aiInsight.confidence}%
                                        </Badge>
                                      )}
                                    </>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => removeFile(form.id, idx)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {/* AI Insights - Compact */}
                              {uploadedFile.aiInsight && !uploadedFile.isValidating && (
                                <div className={`p-2 rounded-lg text-xs space-y-1 ${
                                  uploadedFile.aiInsight.quality === 'excellent' ? 'bg-green-50 border border-green-200' :
                                  uploadedFile.aiInsight.quality === 'good' ? 'bg-blue-50 border border-blue-200' :
                                  uploadedFile.aiInsight.quality === 'fair' ? 'bg-yellow-50 border border-yellow-200' :
                                  'bg-red-50 border border-red-200'
                                }`}>
                                  <div className="flex items-center gap-2 font-semibold">
                                    <Sparkles className="h-3 w-3" />
                                    <span>{t('pages.smart.aiAnalysis', { defaultValue: 'AI Analysis:' })} {uploadedFile.aiInsight.documentType}</span>
                                  </div>
                                  <div className="space-y-0.5 ml-5">
                                    {uploadedFile.aiInsight.suggestions.map((suggestion, sIdx) => (
                                      <p key={sIdx} className="text-xs leading-relaxed">
                                        {suggestion}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Verify All Documents Button */}
                          <Button
                            className="w-full mt-3"
                            size="sm"
                            onClick={() => {
                              const files = uploadedDocs[form.id];
                              const validCount = files.filter(f => f.aiInsight?.quality === 'excellent' || f.aiInsight?.quality === 'good').length;
                              const totalCount = files.length;
                              const allAnalyzed = files.every(f => !f.isValidating && f.aiInsight);
                              
                              if (!allAnalyzed) {
                                toast.warning('Please wait for all documents to be analyzed');
                                return;
                              }
                              
                              const hasExcellent = files.some(f => f.aiInsight?.quality === 'excellent');
                              const hasGood = files.some(f => f.aiInsight?.quality === 'good');
                              const hasPoor = files.some(f => f.aiInsight?.quality === 'poor');
                              
                              if (hasPoor) {
                                toast.error('Verification Failed', {
                                  description: `${validCount}/${totalCount} documents meet quality standards. Please replace poor quality documents.`,
                                  duration: 7000,
                                });
                              } else if (validCount === totalCount && hasExcellent) {
                                toast.success('All Documents Verified! ✓', {
                                  description: `${totalCount} documents passed quality check. Ready for submission.`,
                                  icon: <CheckCircle className="h-5 w-5" />,
                                  duration: 5000,
                                });
                              } else {
                                toast.success('Documents Verified', {
                                  description: `${validCount}/${totalCount} documents are acceptable. Consider improving fair quality documents.`,
                                  duration: 5000,
                                });
                              }
                            }}
                            disabled={!uploadedDocs[form.id] || uploadedDocs[form.id].length === 0 || uploadedDocs[form.id].some(f => f.isValidating)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t('pages.smart.verifyAll', { defaultValue: 'Verify All Documents' })}
                          </Button>
                          
                          {/* Save to Profile Button - Only for logged-in users */}
                          {user && uploadedDocs[form.id] && uploadedDocs[form.id].length > 0 && (
                            <Button
                              variant="outline"
                              className="w-full mt-2"
                              size="sm"
                              onClick={() => saveDocumentsToProfile(form.id)}
                              disabled={
                                savingToProfile[form.id] || 
                                uploadedDocs[form.id].some(f => f.isValidating) ||
                                uploadedDocs[form.id].every(f => f.savedToProfile)
                              }
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {uploadedDocs[form.id].every(f => f.savedToProfile) 
                                ? t('pages.smart.savedToProfile', { defaultValue: 'Saved to Profile ✓' }) 
                                : savingToProfile[form.id] 
                                  ? t('pages.smart.saving', { defaultValue: 'Saving...' }) 
                                  : t('pages.smart.saveToProfile', { defaultValue: 'Save to Profile for Autofill' })}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* What to do next */}
                    {form.nextSteps && form.nextSteps.length > 0 && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg">
                        <p className="font-semibold text-sm mb-2 text-emerald-700">
                          {t('pages.smart.nextSteps', { defaultValue: 'After you fill the form (Next steps):' })}
                        </p>
                        <ol className="list-decimal ml-5 text-sm text-muted-foreground space-y-1">
                          {form.nextSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Nearest Office Info */}
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <Navigation className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-primary mb-1">
                            {t('pages.smart.nearestOffice', { defaultValue: 'Nearest Office' })} ({nearestOffice.district}):
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
                          {t('pages.smart.openPortal', { defaultValue: 'Open Official Portal' })}
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to={`/form-filler?service=${encodeURIComponent(form.name)}`}>
                          {t('pages.smart.fillDemo', { defaultValue: 'Fill a Demo Form' })}
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

