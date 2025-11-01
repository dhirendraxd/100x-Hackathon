import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, User, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import LocationDetector from "./LocationDetector";
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthContext();
  const { t, i18n } = useTranslation('common');
  const currentLang = i18n.language.startsWith('ne') ? 'ne' : 'en';
  const toggleLang = () => {
    const next = currentLang === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(next);
    try { localStorage.setItem('lang', next); } catch (e) { /* ignore */ }
  };

  const navItems = [
    { path: "/", label: t('nav.home'), icon: Home },
    { path: "/form-filler", label: "Fill Forms", icon: Upload },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="Mitra Smart Logo" className="w-full h-full" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              Mitra Smart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
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
            
            {/* Profile Button - Only visible to logged in users */}
            {user && !isActive("/form-progress") && (
              <Link to="/form-progress">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  {user.email?.split("@")[0] || "Profile"}
                </Button>
              </Link>
            )}

            {/* Auth Button - Single Join Now */}
            {!user && (
              <Link to="/signup">
                <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{t('nav.joinNow')}</span>
                </Button>
              </Link>
            )}
            
            {/* Language Switcher */}
            <Button variant="ghost" size="sm" onClick={toggleLang} className="text-xs sm:text-sm">
              {currentLang === 'en' ? 'NE' : 'EN'}
            </Button>
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
          <div className="md:hidden mt-3 sm:mt-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2">
            {navItems
              .filter((item) => !isActive(item.path))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base text-muted-foreground hover:bg-muted"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {item.label}
                  </Link>
                );
              })}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-1.5 sm:pt-2 space-y-1.5 sm:space-y-2">
              {/* Profile Button - Only for logged in users */}
              {user && !isActive("/form-progress") && (
                <Link to="/form-progress" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full gap-2 text-sm sm:text-base py-2.5 sm:py-3">
                    <User className="w-4 h-4" />
                    {user.email?.split("@")[0] || "Profile"}
                  </Button>
                </Link>
              )}

              {/* Language Switcher Mobile */}
              <Button variant="outline" onClick={toggleLang} className="w-full text-sm sm:text-base py-2.5 sm:py-3">
                {currentLang === 'en' ? 'Switch to Nepali' : 'Switch to English'}
              </Button>

              {/* Auth button - Single Join Now */}
              {!user && (
                <div className="border-t border-border/50 pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <p className="text-xs text-muted-foreground mb-2 sm:mb-3 px-2">Save your progress:</p>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full gap-2 justify-start text-sm sm:text-base text-muted-foreground py-2.5 sm:py-3">
                      <User className="w-4 h-4" />
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
