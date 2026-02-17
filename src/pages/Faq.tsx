import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Faq = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="FAQ"
        description="Find answers to common questions about document checks, form filling, accounts, and progress tracking in Mitra Smart."
        path="/faq"
      />
      <Navigation />
      <div className="h-20 md:h-28" />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">FAQ</h1>

        <div className="space-y-4">
          <Card className="bg-card/50 border-white/10">
            <CardHeader><CardTitle>Do I need to log in to use Mitra Smart?</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground text-sm">No. You can browse forms, check documents, and use form filler without login. Login is only needed for saved progress and profile-based features.</CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10">
            <CardHeader><CardTitle>Are these forms official government submissions?</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground text-sm">Mitra Smart helps you prepare accurately, but final submission requirements may vary by office. Always verify with official government portals.</CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10">
            <CardHeader><CardTitle>Can I save my progress?</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground text-sm">Yes. Signed-in users can save drafts and manage submissions from dashboard pages.</CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Faq;
