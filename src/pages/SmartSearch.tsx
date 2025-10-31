import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Sparkles, ArrowRight, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock form database - match user intent to forms
const FORM_DATABASE = [
  {
    id: "passport-form",
    name: "Passport Application Form",
    keywords: ["passport", "travel document", "international travel", "visa"],
    department: "Department of Passport",
    description: "Apply for a new passport or renew your existing one",
    estimatedTime: "30 minutes",
  },
  {
    id: "citizenship-form",
    name: "Citizenship Certificate Application",
    keywords: ["citizenship", "nagarikta", "national id", "identity"],
    department: "District Administration Office",
    description: "Apply for citizenship certificate",
    estimatedTime: "25 minutes",
  },
  {
    id: "driving-license-form",
    name: "Driving License Application",
    keywords: ["driving license", "license", "vehicle", "car", "bike", "motorcycle"],
    department: "Department of Transport Management",
    description: "Apply for a new driving license",
    estimatedTime: "20 minutes",
  },
  {
    id: "pan-card-form",
    name: "PAN Card Registration",
    keywords: ["pan", "tax", "permanent account number", "tax id"],
    department: "Inland Revenue Department",
    description: "Register for PAN (Permanent Account Number)",
    estimatedTime: "15 minutes",
  },
  {
    id: "birth-certificate-form",
    name: "Birth Certificate Application",
    keywords: ["birth certificate", "birth registration", "new born", "baby"],
    department: "Local Administration",
    description: "Register birth and get birth certificate",
    estimatedTime: "20 minutes",
  },
];

const SmartSearch = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<typeof FORM_DATABASE>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Auto-search if query comes from URL
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, [searchParams]);

  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Simple keyword matching algorithm
    const searchTerms = searchQuery.toLowerCase().split(" ");
    const matches = FORM_DATABASE.filter((form) => {
      const formText = `${form.name} ${form.keywords.join(" ")} ${form.description}`.toLowerCase();
      return searchTerms.some((term) => formText.includes(term));
    }).sort((a, b) => {
      // Sort by relevance (number of matching keywords)
      const aMatches = searchTerms.filter((term) => 
        `${a.name} ${a.keywords.join(" ")}`.toLowerCase().includes(term)
      ).length;
      const bMatches = searchTerms.filter((term) => 
        `${b.name} ${b.keywords.join(" ")}`.toLowerCase().includes(term)
      ).length;
      return bMatches - aMatches;
    });

    setTimeout(() => {
      setResults(matches);
      setIsSearching(false);
    }, 500); // Simulate API delay
  };

  const handleSearch = () => {
    performSearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleFormSelect = (formId: string) => {
    // Navigate to form viewer (you can customize this route)
    navigate(`/form-viewer/${formId}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <ParticleBackground />
      <Navigation />

      <div className="container mx-auto max-w-5xl px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Form Search</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-green">
            What do you need help with?
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Just tell us what you want to do, and we'll find the right form for you
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder='Try "I want to get my passport" or "apply for citizenship"...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 h-14 text-lg"
                  />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleSearch}
                  disabled={isSearching || !query.trim()}
                  className="px-8"
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
              
              {/* Quick suggestions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try:</span>
                {["passport", "citizenship", "driving license", "PAN card"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(suggestion);
                      setTimeout(handleSearch, 100);
                    }}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Found {results.length} form{results.length !== 1 ? "s" : ""}
              </h2>
            </div>

            <div className="grid gap-4">
              {results.map((form) => (
                <Card 
                  key={form.id} 
                  className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
                  onClick={() => handleFormSelect(form.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {form.name}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {form.description}
                        </CardDescription>
                      </div>
                      <Button size="sm" className="gap-2">
                        Open <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{form.department}</Badge>
                      <span>⏱️ {form.estimatedTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {query && results.length === 0 && !isSearching && (
          <Card className="max-w-2xl mx-auto text-center p-12">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No forms found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any forms matching "{query}". Try different keywords or browse our form library.
              </p>
              <Button onClick={() => navigate("/form-library")}>
                Browse All Forms
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SmartSearch;
