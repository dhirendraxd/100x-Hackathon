import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, User, LogIn, Upload, Library, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import LocationDetector from "./LocationDetector";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthContext();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/form-library", label: "Form Library", icon: Library },
    { path: "/form-scraper", label: "Form Scraper", icon: Upload },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      {/* Location Bar - Top Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-2">
              <span>📍</span>
              <span>Your location helps us find nearby offices and services</span>
            </div>
            <div className="flex-1 sm:flex-none flex justify-center sm:justify-end">
              <LocationDetector />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="Mitra Smart Logo" className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Mitra Smart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems
              .filter((item) => !isActive(item.path))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-2 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            
            {/* My Progress visible to all users (hide on current page) */}
            {!isActive("/form-progress") && (
              <Link to="/form-progress">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  My Progress
                </Button>
              </Link>
            )}

            {/* Auth Buttons */}
            {!user && (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="gap-2 bg-gradient-primary">
                    <User className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {navItems
              .filter((item) => !isActive(item.path))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            
            {/* Mobile Auth Button */}
            <div className="pt-2">
              {!isActive("/form-progress") && (
                <Link to="/form-progress" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 mb-2">
                    <BarChart3 className="w-4 h-4" />
                    My Progress
                  </Button>
                </Link>
              )}
              {!user && (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full gap-2 mb-2">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full gap-2 bg-gradient-primary">
                      <User className="w-4 h-4" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
