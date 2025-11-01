import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, User, LogIn, Upload, Library, BarChart3 } from "lucide-react";
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
    { path: "/form-library", label: t('nav.formLibrary'), icon: Library },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
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
            
            {/* My Progress - Only visible to logged in users */}
            {user && !isActive("/form-progress") && (
              <Link to="/form-progress">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('nav.myProgress')}
                </Button>
              </Link>
            )}

            {/* Auth Button - Single Join Now */}
            {!user && (
              <div className="flex items-center ml-4 pl-4 border-l border-border/50">
                <Link to="/signup">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs">{t('nav.joinNow')}</span>
                  </Button>
                </Link>
              </div>
            )}
            {/* Language Switcher */}
            <div className="flex items-center ml-4 pl-4 border-l border-border/50">
              <Button variant="ghost" size="sm" onClick={toggleLang}>
                {currentLang === 'en' ? t('language.nepali') : t('language.english')}
              </Button>
            </div>

            {/* Logged in user badge */}
            {user && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border/50">
                <Badge variant="outline" className="gap-2">
                  <User className="w-3 h-3" />
                  {user.email?.split("@")[0] || "User"}
                </Badge>
              </div>
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
            
            {/* Mobile Auth Buttons */}
            <div className="pt-2 space-y-2">
              {/* My Progress - Only for logged in users */}
              {user && !isActive("/form-progress") && (
                <Link to="/form-progress" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full gap-2">
                    <BarChart3 className="w-4 h-4" />
                    My Progress
                  </Button>
                </Link>
              )}

              {/* Auth button - Single Join Now */}
              {!user && (
                <div className="border-t border-border/50 pt-4 mt-4">
                  <p className="text-xs text-muted-foreground mb-3 px-2">Save your progress:</p>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full gap-2 justify-start text-muted-foreground">
                      <User className="w-4 h-4" />
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}

              {/* Logged in user */}
              {user && (
                <div className="border-t border-border/50 pt-4 mt-4">
                  <Badge variant="outline" className="gap-2">
                    <User className="w-3 h-3" />
                    {user.email?.split("@")[0] || "User"}
                  </Badge>
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
