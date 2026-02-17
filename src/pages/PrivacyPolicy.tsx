import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <SEO
        title="Privacy Policy"
        description="Read how Mitra Smart handles account data, uploaded documents, and usage information with privacy-first practices."
        path="/privacy-policy"
      />
      <Navigation />
      <div className="h-20 md:h-28" />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Privacy Policy</h1>

        <Card className="bg-card/50 border-white/10">
          <CardContent className="pt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>We collect only the information needed to provide document checking, form assistance, and account-related features.</p>
            <p>Uploaded files and profile data are used to improve your experience, including autofill and progress tracking.</p>
            <p>We do not claim to be an official government authority and encourage users to verify final requirements with official portals.</p>
            <p>For privacy requests, contact <a href="mailto:support@mitrasmart.com" className="text-primary hover:underline">support@mitrasmart.com</a>.</p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
