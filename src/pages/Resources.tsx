import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Resources = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="Resources"
        description="Explore official guidance, FAQs, help options, and policy pages for using Mitra Smart effectively."
        path="/resources"
      />
      <Navigation />
      <div className="h-20 md:h-28" />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Resources</h1>
          <p className="text-muted-foreground mt-3">
            Making government documentation simple, accurate, and stress-free for every citizen.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle>Guidance Pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><Link to="/faq" className="text-primary hover:underline">FAQ</Link></p>
              <p><Link to="/help-center" className="text-primary hover:underline">Help Center</Link></p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle>Legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link></p>
              <p><Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link></p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Resources;
