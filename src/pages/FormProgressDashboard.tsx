import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getScrapedForms, deleteScrapedForm } from "@/services/formScraperService.mock";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Folders,
  Plus,
  Eye,
  LogOut,
  Upload,
  BarChart3,
  Trash2,
  Edit,
  Info,
} from "lucide-react";

interface FormDraft {
  id: string;
  formId: string;
  formName: string;
  progress: number;
  lastModified: Date;
  fieldsCompleted: number;
  totalFields: number;
}

interface UploadedForm {
  id: string;
  name: string;
  createdAt: Date;
  fieldsCount: number;
  published: boolean;
  tags: string[];
}

const normalizeTimestamp = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object') {
    const maybe = value as { toDate?: () => Date };
    if (typeof maybe.toDate === 'function') {
      try {
        return maybe.toDate();
      } catch (e) {
        // ignore and fall through
      }
    }
  }
  const parsed = new Date(typeof value === 'string' || typeof value === 'number' ? value : String(value));
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const FormProgressDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const [drafts, setDrafts] = useState<FormDraft[]>([]);
  const [uploadedForms, setUploadedForms] = useState<UploadedForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Allow guests to view local progress; no redirect
    loadDashboardData();
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

  const loadDashboardData = () => {
    const allDrafts: FormDraft[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("form_draft_")) {
        try {
          const formId = key.replace("form_draft_", "");
          const draftData = localStorage.getItem(key);
          if (draftData) {
            const parsedData = JSON.parse(draftData);
            const fieldsCompleted = Object.values(parsedData).filter(
              (v) => v !== "" && v !== null && v !== undefined
            ).length;
            
            allDrafts.push({
              id: key,
              formId,
              formName: `Form ${formId.substring(0, 8)}...`,
              progress: Math.round((fieldsCompleted / (Object.keys(parsedData).length || 1)) * 100),
              lastModified: new Date(),
              fieldsCompleted,
              totalFields: Object.keys(parsedData).length,
            });
          }
        } catch (error) {
          console.error("Error parsing draft:", error);
        }
      }
    }

    const scrapedForms = getScrapedForms();
    const userForms: UploadedForm[] = scrapedForms.map(form => {
      const createdAt = normalizeTimestamp((form as unknown as { createdAt?: unknown }).createdAt);
      return {
        id: form.id!,
        name: form.name,
        createdAt,
        fieldsCount: form.originalFields?.length || 0,
        published: form.published || false,
        tags: form.tags || [],
      };
    });

    setDrafts(allDrafts);
    setUploadedForms(userForms);
    setIsLoading(false);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-400";
    if (progress >= 50) return "text-yellow-400";
    return "text-orange-400";
  };

  const handleDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(draftId);
    setDrafts(drafts.filter(d => d.id !== draftId));
    toast.success("Draft deleted");
  };

  const handleDeleteForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = deleteScrapedForm(formId);
    if (success) {
      setUploadedForms(uploadedForms.filter(f => f.id !== formId));
      toast.success("Form deleted successfully");
    } else {
      toast.error("Failed to delete form");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
  <Navigation />
  <div className="h-20 md:h-28" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                My Dashboard
              </h1>
              <p className="text-sm md:text-base text-gray-400 mt-1">
                Track your form progress and manage uploads
              </p>
            </div>
            <div className="flex items-center">
              <Button onClick={handleSignOut} variant="ghost" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-card/50 backdrop-blur border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Forms</p>
                    <p className="text-3xl font-bold text-white">{uploadedForms.length}</p>
                  </div>
                  <Upload className="h-10 w-10 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-card/50 backdrop-blur border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">In Progress</p>
                    <p className="text-3xl font-bold text-white">{drafts.length}</p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-card/50 backdrop-blur border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Published</p>
                    <p className="text-3xl font-bold text-white">
                      {uploadedForms.filter(f => f.published).length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-card/50 backdrop-blur border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Completion Rate</p>
                    <p className="text-3xl font-bold text-white">
                      {drafts.length > 0 ? Math.round(drafts.reduce((sum, d) => sum + d.progress, 0) / drafts.length) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-yellow-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {!user && (
          <Alert className="border-blue-500/50 bg-blue-500/10 mb-6">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              Sign in to sync your forms across devices and access advanced features.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="uploaded" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur border border-white/10">
            <TabsTrigger value="uploaded" className="gap-2">
              <Upload className="h-4 w-4" />
              My Uploaded Forms ({uploadedForms.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending Forms ({drafts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploaded" className="space-y-4">
            {isLoading ? (
              <Card className="bg-card/50 backdrop-blur border-white/10">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading forms...</p>
                </CardContent>
              </Card>
            ) : uploadedForms.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur border-white/10">
                <CardContent className="p-8 text-center">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No uploaded forms yet</h3>
                  <p className="text-gray-400 mb-4">Upload a government form to get started</p>
                  <Button onClick={() => navigate("/form-scraper")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Upload Form
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedForms.map((form) => (
                  <Card key={form.id} className="bg-card/50 backdrop-blur border-white/10 hover:border-primary/50 transition-all group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="line-clamp-1">{form.name}</span>
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            Created: {new Date(form.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {form.published && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Fields</span>
                        <span className="text-white font-semibold">{form.fieldsCount}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {form.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex gap-2">
                        <Button onClick={() => navigate(`/form-viewer/${form.id}`)} className="flex-1" size="sm">
                          <Eye className="h-4 w-4 mr-2" />View
                        </Button>
                        <Button onClick={() => navigate(`/form-builder/${form.id}`)} variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />Fill
                        </Button>
                        <Button onClick={(e) => handleDeleteForm(form.id, e)} variant="outline" size="sm" className="gap-2 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <Card className="bg-card/50 backdrop-blur border-white/10">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading drafts...</p>
                </CardContent>
              </Card>
            ) : drafts.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur border-white/10">
                <CardContent className="p-8 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No pending forms</h3>
                  <p className="text-gray-400 mb-4">Start filling out a form to see your progress here</p>
                  <Button onClick={() => navigate("/form-library")} className="gap-2">
                    <Plus className="h-4 w-4" />Browse Forms
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drafts.map((draft) => (
                  <Card key={draft.id} className="bg-card/50 backdrop-blur border-white/10 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />{draft.formName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Last modified: {draft.lastModified.toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant={draft.progress >= 80 ? "default" : "secondary"} className={draft.progress >= 80 ? "bg-green-500" : ""}>
                          {draft.progress}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span className="text-gray-400">Overall Progress</span>
                          <span className={`font-semibold ${getProgressColor(draft.progress)}`}>{draft.progress}%</span>
                        </div>
                        <Progress value={draft.progress} className="h-2" />
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Completed</p>
                          <p className="text-sm font-semibold text-white">{draft.fieldsCompleted}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Remaining</p>
                          <p className="text-sm font-semibold text-white">{draft.totalFields - draft.fieldsCompleted}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total</p>
                          <p className="text-sm font-semibold text-white">{draft.totalFields}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => navigate(`/form-builder/${draft.formId}`)} className="flex-1" size="sm">Continue</Button>
                        <Button onClick={(e) => handleDeleteDraft(draft.id, e)} variant="outline" size="sm" className="gap-2 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card className="bg-card/50 backdrop-blur border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Folders className="h-5 w-5 text-primary" />Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => navigate("/form-scraper")} variant="outline" className="justify-start gap-2 h-auto py-4">
              <Upload className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Upload New Form</div>
                <div className="text-xs text-gray-400">Scrape a government form</div>
              </div>
            </Button>
            <Button onClick={() => navigate("/form-library")} variant="outline" className="justify-start gap-2 h-auto py-4">
              <Folders className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Browse Library</div>
                <div className="text-xs text-gray-400">Find forms to fill</div>
              </div>
            </Button>
            <Button onClick={() => navigate("/document-checker")} variant="outline" className="justify-start gap-2 h-auto py-4">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Check Documents</div>
                <div className="text-xs text-gray-400">Validate your files</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormProgressDashboard;
