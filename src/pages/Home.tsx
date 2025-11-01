import { CheckCircle2, FileText, Clock, ArrowRight, Shield, Zap, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/AuthContext";
import LocationDetector from "@/components/LocationDetector";
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { user } = useAuthContext();
  const { t } = useTranslation('common');

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
                  {t('hero.badge')}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight animate-fade-in">
                <span className="text-white">{t('hero.titleLine1')} </span>
                <br />
                <span className="gradient-text-green">{t('hero.titleLine2')}</span>
                <br />
                <span className="gradient-text-green">{t('hero.titleLine3')}</span>
              </h1>
              
              <p className="text-base md:text-[17px] text-gray-400 max-w-xl animate-fade-in leading-relaxed">
                {t('hero.desc')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                {user ? (
                  <>
                    <Link to="/form-library">
                      <Button size="lg" className="gap-2 group bg-primary hover:bg-primary/90 px-6 py-5">
                        {t('hero.formLibrary')}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/form-scraper">
                      <Button size="lg" variant="outline" className="gap-2 border-white/10 hover:bg-white/5 px-6 py-5">
                        {t('hero.scrapeForm')}
                        <Upload className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/search">
                      <Button size="lg" className="gap-2 group bg-primary hover:bg-primary/90 px-6 py-5">
                        {t('hero.getStarted')}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/form-library">
                      <Button size="lg" variant="outline" className="gap-2 border-white/10 hover:bg-white/5 px-6 py-5">
                        {t('hero.browseForms')}
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Location Detector below buttons */}
              <div className="animate-fade-in flex justify-start">
                <LocationDetector />
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
              <span className="gradient-text-green">{t('why.title1')}</span>{" "}
              <span className="text-white">{t('why.title2')}</span>
            </h2>
            <p className="text-lg text-gray-400">
              {t('why.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="group transition-colors border border-white/10 bg-black/10 backdrop-blur-xl hover:border-white/20">
              <CardContent className="p-7">
                <div className="mb-5 inline-flex p-3.5 rounded-xl bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{t('why.card1Title')}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{t('why.card1Desc')}</p>
              </CardContent>
            </Card>

            <Card className="group transition-colors border border-white/10 bg-black/10 backdrop-blur-xl hover:border-white/20">
              <CardContent className="p-7">
                <div className="mb-5 inline-flex p-3.5 rounded-xl bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{t('why.card2Title')}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{t('why.card2Desc')}</p>
              </CardContent>
            </Card>

            <Card className="group transition-colors border border-white/10 bg-black/10 backdrop-blur-xl hover:border-white/20">
              <CardContent className="p-7">
                <div className="mb-5 inline-flex p-3.5 rounded-xl bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{t('why.card3Title')}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{t('why.card3Desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              <span className="text-white">{t('works.title1')}</span>{" "}
              <span className="gradient-text-green">{t('works.title2')}</span>
            </h2>
            <p className="text-lg text-gray-400">
              {t('works.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border border-white/10 bg-black/10 backdrop-blur-xl text-center group hover:border-white/20 transition-colors">
              <CardContent className="p-7 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  1
                </div>
                <h3 className="text-lg font-bold text-white">{t('works.step1Title')}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t('works.step1Desc')}</p>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-black/10 backdrop-blur-xl text-center group hover:border-white/20 transition-colors">
              <CardContent className="p-7 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  2
                </div>
                <h3 className="text-lg font-bold text-white">{t('works.step2Title')}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t('works.step2Desc')}</p>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-black/10 backdrop-blur-xl text-center group hover:border-white/20 transition-colors">
              <CardContent className="p-7 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  3
                </div>
                <h3 className="text-lg font-bold text-white">{t('works.step3Title')}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t('works.step3Desc')}</p>
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
                <span className="gradient-text-green">{t('cta.ready')}</span>
              </h2>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
                {user ? t('cta.authedDesc') : t('cta.guestDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                {user ? (
                  <>
                    <Link to="/form-library">
                      <Button size="lg" className="gap-2 group bg-primary hover:bg-primary/90 px-6 py-5">
                        {t('cta.browse')}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/form-scraper">
                      <Button size="lg" variant="outline" className="gap-2 border-white/10 hover:bg-white/5 px-6 py-5">
                        {t('cta.scrape')}
                        <Upload className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button size="lg" className="gap-2 group bg-primary hover:bg-primary/90 px-6 py-5">
                        {t('cta.login')}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="lg" variant="outline" className="gap-2 border-white/10 hover:bg-white/5 px-6 py-5">
                        {t('cta.signup')}
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
