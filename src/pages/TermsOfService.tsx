import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="Terms of Service"
        description="Review the terms for using Mitra Smart, including user responsibilities and service limitations."
        path="/terms-of-service"
      />
      <Navigation />
      <div className="h-20 md:h-28" />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Terms of Service</h1>

        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>Mitra Smart provides guidance tools to help users prepare government documentation accurately.</p>
            <p>Users are responsible for verifying all final requirements with official government agencies and submitting correct information.</p>
            <p>Service availability and features may change as the platform evolves.</p>
            <p>By using this platform, you agree to these terms and responsible usage of the service.</p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
