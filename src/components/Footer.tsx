import { Link } from "react-router-dom";
import { Mail, Github, Twitter } from "lucide-react";

interface FooterProps {
  compact?: boolean;
}

const Footer = ({ compact = false }: FooterProps) => {
  if (compact) {
    return (
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Mitra Smart Logo" className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Mitra Smart</span>
            </div>
            <p>© 2025 All rights reserved.</p>
            <p>Made with <span className="text-primary">♥</span> for Nepali Citizens</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.svg" alt="Mitra Smart Logo" className="w-full h-full" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Mitra Smart
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Making government documentation simple, accurate, and stress-free for every citizen.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/document-checker" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Document Checker
              </Link>
              <Link to="/form-filler" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Form Filler
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-all hover:scale-110" aria-label="Email">
                <Mail className="w-5 h-5 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-all hover:scale-110" aria-label="GitHub">
                <Github className="w-5 h-5 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-all hover:scale-110" aria-label="Twitter">
                <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">support@mitrasmart.com</p>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 Mitra Smart. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">Made with <span className="text-primary">♥</span> for Nepali Citizens</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
