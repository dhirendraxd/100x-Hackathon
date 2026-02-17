import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="Help Center"
        description="Get support for account access, document upload issues, and form completion guidance on Mitra Smart."
        path="/help-center"
      />
      <Navigation />
      <div className="h-20 md:h-28" />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Help Center</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-white/10">
            <CardHeader><CardTitle>Getting Started</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground text-sm space-y-2">
              <p>1. Open Document Checker and validate your files.</p>
              <p>2. Go to Form Filler and complete required fields.</p>
              <p>3. Save progress and review before final submission.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardHeader><CardTitle>Contact Support</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              For assistance, email <a href="mailto:support@mitrasmart.com" className="text-primary hover:underline">support@mitrasmart.com</a> with a brief description of your issue.
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
