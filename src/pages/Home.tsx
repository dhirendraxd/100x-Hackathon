import { CheckCircle2, FileText, Clock, ArrowRight, Shield, Zap, Upload, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Home = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
  <ParticleBackground />
      
      <section className="relative min-h-screen gradient-hero">
        <Navigation />
        
        <div className="container mx-auto max-w-7xl px-4 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
            <div className="text-left z-10 space-y-8">
              <div className="animate-fade-in">
                <span className="inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-foreground/80 text-xs font-medium backdrop-blur-sm">
                  Your Smart Form Assistant • Mitra Smart
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight animate-fade-in">
                <span className="text-white">Simplify Your </span>
                <br />
                <span className="gradient-text-green">Nepal Government</span>
                <br />
                <span className="gradient-text-green">Form Journey</span>
              </h1>
              
              <p className="text-base md:text-[17px] text-gray-400 max-w-xl animate-fade-in leading-relaxed">
                Digitize, understand, and fill Nepal government forms with ease. 
                From passport applications to citizenship forms — all in one place.
              </p>

              {/* Smart Search Bar */}
              <div className="animate-fade-in">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder='Try "I want to get my passport" or "citizenship"...'
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="pl-11 h-12 bg-background/50 border-white/10 text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <Button 
                        size="lg" 
                        onClick={handleSearch}
                        disabled={!searchQuery.trim()}
                        className="px-6"
                      >
                        Search
                      </Button>
                    </div>
                    
                    {/* Login hint for non-logged in users */}
                    {!user && (
                      <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2 text-sm">
                        <span className="text-primary">💡</span>
                        <span className="text-foreground/90">
                          <Link to="/login" className="text-primary hover:underline font-medium">Login</Link> or <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link> to save your progress and access your forms anytime
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                {user ? (
                  <>
                    <Link to="/form-library">
                      <Button size="lg" className="gap-2 group bg-primary hover:bg-primary/90 px-6 py-5">
                        FORM LIBRARY
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/form-scraper">
                      <Button size="lg" variant="outline" className="gap-2 border-white/10 hover:bg-white/5 px-6 py-5">
                        SCRAPE FORM
                        <Upload className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button size="lg" className="gap-2 group bg-primary hover:bg-primary/90 px-6 py-5">
                        LOGIN
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="lg" variant="outline" className="gap-2 border-white/10 hover:bg-white/5 px-6 py-5">
                        SIGN UP
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center relative">
              <div className="relative w-full h-[600px] flex items-center justify-center">
                {/* Breathing glowing orb effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 via-primary/8 to-transparent blur-2xl animate-breathe"></div>
                </div>
                {/* Very subtle decorative rings - low opacity */}
                <div className="relative z-10 opacity-20">
                  <div className="w-80 h-80 rounded-full border border-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>
                  <div className="w-64 h-64 rounded-full border border-primary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-reverse"></div>
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm"></div>
                  {/* Subtle center icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40">
                    <Shield className="w-16 h-16 text-primary/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-dark relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              <span className="gradient-text-green">Why Choose</span>{" "}
              <span className="text-white">Form Mitra Smart?</span>
            </h2>
            <p className="text-lg text-gray-400">
              Cutting-edge technology meets user-friendly design
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="group transition-colors border border-white/10 bg-black/10 backdrop-blur-xl hover:border-white/20">
              <CardContent className="p-7">
                <div className="mb-5 inline-flex p-3.5 rounded-xl bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Nepal Government Forms</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Access passport, citizenship, PAN card, and other official Nepal government forms.
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-colors border border-white/10 bg-black/10 backdrop-blur-xl hover:border-white/20">
              <CardContent className="p-7">
                <div className="mb-5 inline-flex p-3.5 rounded-xl bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Simplified Forms</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  User-friendly forms with Nepali language support, helpful hints, and examples.
                </p>
              </CardContent>
            </Card>

            <Card className="group transition-colors border border-white/10 bg-black/10 backdrop-blur-xl hover:border-white/20">
              <CardContent className="p-7">
                <div className="mb-5 inline-flex p-3.5 rounded-xl bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Save Time</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Complete government paperwork faster with step-by-step guidance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              <span className="text-white">How It</span>{" "}
              <span className="gradient-text-green">Works</span>
            </h2>
            <p className="text-lg text-gray-400">
              Three simple steps to complete your forms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border border-white/10 bg-black/10 backdrop-blur-xl text-center group hover:border-white/20 transition-colors">
              <CardContent className="p-7 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  1
                </div>
                <h3 className="text-lg font-bold text-white">Browse Forms</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Find the Nepal government form you need from our library.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-black/10 backdrop-blur-xl text-center group hover:border-white/20 transition-colors">
              <CardContent className="p-7 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  2
                </div>
                <h3 className="text-lg font-bold text-white">Fill Step-by-Step</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Complete forms with helpful hints and examples in Nepali and English.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-black/10 backdrop-blur-xl text-center group hover:border-white/20 transition-colors">
              <CardContent className="p-7 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  3
                </div>
                <h3 className="text-lg font-bold text-white">Track Progress</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Save drafts and continue anytime — all forms saved locally.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-32 px-4 bg-gradient-dark">
        <div className="container mx-auto max-w-4xl">
          <Card className="border border-white/10 bg-black/10 backdrop-blur-xl">
            <CardContent className="p-10 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="gradient-text-green">Ready to Get Started?</span>
              </h2>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
                {user ? 'Access your form tools instantly.' : 'Create an account to start managing government forms easily.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                {user ? (
                  <>
                    <Link to="/form-library">
                      <Button size="lg" className="gap-2 group bg-primary hover:bg-primary/90 px-6 py-5">
                        Browse Forms
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/form-scraper">
                      <Button size="lg" variant="outline" className="gap-2 border-white/10 hover:bg-white/5 px-6 py-5">
                        Scrape New Form
                        <Upload className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button size="lg" className="gap-2 group bg-primary hover:bg-primary/90 px-6 py-5">
                        Login
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="lg" variant="outline" className="gap-2 border-white/10 hover:bg-white/5 px-6 py-5">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer compact />
    </div>
  );
};

export default Home;
