import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  FileText, 
  LogOut, 
  User, 
  Clock,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getUserValidations, getUserForms } from '@/services/userDataService';
import type { DocumentValidation } from '@/services/documentValidation';
import type { FormData } from '@/services/formService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';

const Dashboard = () => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [validations, setValidations] = useState<DocumentValidation[]>([]);
  const [forms, setForms] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [health, setHealth] = useState<{ firestore?: string; functions?: string } | null>(null);
  const usingEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === '1';

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const [userValidations, userForms] = await Promise.all([
          getUserValidations(user.uid),
          getUserForms(user.uid)
        ]);
        
        setValidations(userValidations);
        setForms(userForms);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load your data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(error);
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  const stats = {
    totalValidations: validations.length,
    successfulValidations: validations.filter(v => v.status === 'completed').length,
    totalForms: forms.length,
    draftForms: forms.filter(f => f.status === 'draft').length,
  };

  const runHealthCheck = async () => {
    setHealth(null);
    // Firestore write test
    try {
      await addDoc(collection(db, 'health_checks'), {
        userId: user?.uid || 'anonymous',
        ts: serverTimestamp(),
      });
      setHealth((h) => ({ ...(h || {}), firestore: 'ok' }));
    } catch (e) {
      setHealth((h) => ({ ...(h || {}), firestore: e instanceof Error ? e.message : 'error' }));
    }

    // Functions callable test
    try {
      const callValidate = httpsCallable(functions, 'validateDocument');
      const resp = await callValidate({ imageBase64: '', documentType: 'HealthCheck' });
      if (resp && 'data' in resp) {
        setHealth((h) => ({ ...(h || {}), functions: 'ok' }));
      } else {
        setHealth((h) => ({ ...(h || {}), functions: 'no data' }));
      }
    } catch (e) {
      setHealth((h) => ({ ...(h || {}), functions: e instanceof Error ? e.message : 'error' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative">
  <ParticleBackground />
      <Navigation />
      
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back, {user?.email?.split('@')[0]}!
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Info card explaining dashboard */}
          {validations.length === 0 && forms.length === 0 && !isLoading && (
            <Card className="mb-8 border-primary/50 bg-primary/10">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">
                      Your Activity Hub
                    </p>
                    <p className="text-sm text-muted-foreground">
                      All your document validations and form submissions will appear here. 
                      Start by validating a document or filling a form using the Quick Actions below.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Health */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card className="bg-black/40 backdrop-blur-xl border-border">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Quick connectivity checks for your environment</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  <div>Mode: {usingEmulators ? 'Firebase Emulators' : 'Production Firebase'}</div>
                  <div>Origin: {typeof window !== 'undefined' ? window.location.origin : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={runHealthCheck}>Run health check</Button>
                  {health && (
                    <div className="text-xs text-muted-foreground">
                      <div>Firestore: {health.firestore || '—'}</div>
                      <div>Functions: {health.functions || '—'}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-black/40 backdrop-blur-xl border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Validations</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalValidations}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Successful</p>
                    <p className="text-3xl font-bold text-secondary">{stats.successfulValidations}</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Forms</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalForms}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Draft Forms</p>
                    <p className="text-3xl font-bold text-yellow-500">{stats.draftForms}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Validations */}
            <Card className="bg-black/40 backdrop-blur-xl border-border">
              <CardHeader>
                <CardTitle>Recent Validations</CardTitle>
                <CardDescription>Your latest document checks</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : validations.length === 0 ? (
                  <div className="text-center py-8">
                    <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-4">No validations yet</p>
                    <Button onClick={() => navigate('/form-library')}>
                      Browse Forms
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {validations.slice(0, 5).map((validation) => (
                      <div
                        key={validation.id}
                        className="flex items-start justify-between p-4 rounded-lg bg-black/20 border border-border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {validation.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-secondary" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                            <p className="font-medium text-foreground">{validation.documentType}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{validation.fileName}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {validation.timestamp.toDate().toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded ${
                            validation.status === 'completed' 
                              ? 'bg-secondary/20 text-secondary' 
                              : 'bg-destructive/20 text-destructive'
                          }`}>
                            {validation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Forms */}
            <Card className="bg-black/40 backdrop-blur-xl border-border">
              <CardHeader>
                <CardTitle>Recent Forms</CardTitle>
                <CardDescription>Your saved and submitted forms</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : forms.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-4">No forms yet</p>
                    <Button onClick={() => navigate('/form-filler')}>
                      Create Form
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {forms.slice(0, 5).map((form) => (
                      <div
                        key={form.id}
                        className="flex items-start justify-between p-4 rounded-lg bg-black/20 border border-border"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground mb-1">{form.formType}</p>
                          <p className="text-sm text-muted-foreground">
                            {String(form.data.fullName) || 'Untitled Form'}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {form.lastUpdated.toDate().toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded ${
                            form.status === 'submitted' 
                              ? 'bg-secondary/20 text-secondary' 
                              : form.status === 'draft'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {form.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="bg-black/40 backdrop-blur-xl border-border hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate('/form-library')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Browse Forms</h3>
                      <p className="text-sm text-muted-foreground">Find and fill government forms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-black/40 backdrop-blur-xl border-border hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate('/form-scraper')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Scrape New Form</h3>
                      <p className="text-sm text-muted-foreground">Upload and digitize a government form</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
