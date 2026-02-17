import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getScrapedForms } from "@/services/formScraperService.mock";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { GovernmentForm } from "@/types/governmentForms";
import { 
  FileText, 
  Search, 
  Clock, 
  BarChart3, 
  Filter,
  Eye,
  Download,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import SEO from "@/components/SEO";

const FormLibrary = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [forms, setForms] = useState<GovernmentForm[]>([]);
  const [filteredForms, setFilteredForms] = useState<GovernmentForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const departments = [
    "All Departments",
    "Department of Passports",
    "Department of Revenue",
    "Department of National ID",
    "Department of Immigration",
    "Ministry of Home Affairs",
    "Ministry of Foreign Affairs",
    "Local Government",
    "General",
    "Other",
  ];

  const difficulties = ["All Levels", "easy", "medium", "hard"];

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    filterForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedDepartment, selectedDifficulty, forms]);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const scrapedData = getScrapedForms().filter((f) => f.published);
      // Fetch published forms from Firestore for cross-user visibility
      let remote: GovernmentForm[] = [];
      try {
        const q = query(
          collection(db, "government_forms"),
          where("published", "==", true),
          orderBy("updatedAt", "desc"),
          limit(100)
        );
        const snap = await getDocs(q);
        remote = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GovernmentForm, 'id'>) }));
      } catch (_) {
        // Ignore Firestore errors; fall back to local only
      }
      // Merge and de-duplicate by id
      const map = new Map<string, GovernmentForm>();
      [...remote, ...scrapedData].forEach((f) => {
        if (f.id) map.set(f.id, f);
      });
      const allForms = Array.from(map.values());
      setForms(allForms);
      setFilteredForms(allForms);
    } catch (error) {
      console.error("Error loading forms:", error);
      toast.error("Failed to load forms");
    } finally {
      setIsLoading(false);
    }
  };

  const filterForms = () => {
    let filtered = [...forms];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (form) =>
          form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          form.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          form.documentType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment && selectedDepartment !== "all") {
      filtered = filtered.filter((form) => form.department === selectedDepartment);
    }

    // Difficulty filter
    if (selectedDifficulty && selectedDifficulty !== "all") {
      filtered = filtered.filter((form) => form.difficulty === selectedDifficulty);
    }

    setFilteredForms(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleViewForm = (formId: string) => {
    navigate(`/form-viewer/${formId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="Form Library"
        description="Browse digitized Nepal government forms by department and difficulty with Form Mitra Smart."
        path="/form-library"
      />
      <Navigation />
  <div className="h-20 md:h-28" />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{t('nav.formLibrary')}</h1>
          <p className="text-gray-300 text-lg">
            {t('pages.library.subtitle', { defaultValue: 'Browse and explore digitized government forms' })}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              {t('pages.library.searchFilter', { defaultValue: 'Search & Filter' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('pages.library.searchPlaceholder', { defaultValue: 'Search forms...' })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Department Filter */}
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder={t('pages.library.allDepartments', { defaultValue: 'All Departments' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.library.allDepartments', { defaultValue: 'All Departments' })}</SelectItem>
                  {departments.slice(1).map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder={t('pages.library.allLevels', { defaultValue: 'All Levels' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('pages.library.allLevels', { defaultValue: 'All Levels' })}</SelectItem>
                  {difficulties.slice(1).map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm">
            {t('pages.library.showingCount', { defaultValue: 'Showing {{count}} of {{total}} forms', count: filteredForms.length, total: forms.length })}
          </p>
        </div>

        {/* Forms Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-card/50 backdrop-blur border-white/10">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredForms.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{t('pages.library.noForms', { defaultValue: 'No forms found' })}</h3>
              <p className="text-gray-400">
                {t('pages.library.tryAdjust', { defaultValue: 'Try adjusting your search or filters' })}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card
                key={form.id}
                className="bg-card/50 backdrop-blur border-white/10 hover:border-primary/50 transition-all hover:shadow-glow group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                    <Badge className={getDifficultyColor(form.difficulty)}>
                      {form.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {form.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {form.department}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {form.aiAnalysis?.tips?.[0] || `Government form for ${form.documentType}`}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{form.aiAnalysis?.estimatedCompletionMinutes || 15} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <BarChart3 className="h-3 w-3" />
                      <span>{form.originalFields?.length || 0} fields</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Eye className="h-3 w-3" />
                      <span>{form.statistics?.totalSubmissions || 0} submissions</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Download className="h-3 w-3" />
                      <span>{Math.round((form.statistics?.successRate || 0) * 100)}% success</span>
                    </div>
                  </div>

                  {/* Document Type Badge */}
                  <Badge variant="outline" className="text-xs">
                    {form.documentType}
                  </Badge>

                  {/* Publisher info */}
                  {(form.published && (form.publishedByName || form.publishedByEmail)) && (
                    <p className="text-xs text-gray-500">Published by {form.publishedByName || form.publishedByEmail}</p>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleViewForm(form.id!)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    variant="outline"
                  >
                    {t('pages.library.viewForm', { defaultValue: 'View Form' })}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormLibrary;
