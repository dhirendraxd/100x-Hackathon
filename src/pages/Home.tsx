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
        
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-200px)]">
            <div className="text-left z-10 space-y-6 md:space-y-8">
              <div className="animate-fade-in">
                <span className="inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-foreground/80 text-xs sm:text-sm font-medium backdrop-blur-sm">
                  {t('hero.badge')}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight animate-fade-in">
                <span className="text-white">{t('hero.titleLine1')} </span>
                <br />
                <span className="gradient-text-green">{t('hero.titleLine2')}</span>
                <br />
                <span className="gradient-text-green">{t('hero.titleLine3')}</span>
              </h1>
              
              <p className="text-sm sm:text-base md:text-[17px] text-gray-400 max-w-xl animate-fade-in leading-relaxed">
                {t('hero.desc')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in">
                <Link to="/search" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 group bg-primary hover:bg-primary/90 px-6 py-4 md:py-5 text-sm md:text-base">
                    {t('hero.getStarted')}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/form-filler" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-white/10 hover:bg-white/5 px-6 py-4 md:py-5 text-sm md:text-base">
                    Fill Forms
                    <FileText className="h-4 w-4" />
                  </Button>
                </Link>
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

      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-dark relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              <span className="gradient-text-green">{t('why.title1')}</span>{" "}
              <span className="text-white">{t('why.title2')}</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              {t('why.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <Card className="group transition-colors border border-white/10 bg-black/10 backdrop-blur-xl hover:border-white/20 sm:col-span-2 md:col-span-1">
              <CardContent className="p-5 sm:p-6 md:p-7">
                <div className="mb-4 sm:mb-5 inline-flex p-3 sm:p-3.5 rounded-xl bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">{t('why.card1Title')}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{t('why.card1Desc')}</p>
              </CardContent>
            </Card>

            <Card className="group transition-colors border border-white/10 bg-black/10 backdrop-blur-xl hover:border-white/20">
              <CardContent className="p-5 sm:p-6 md:p-7">
                <div className="mb-4 sm:mb-5 inline-flex p-3 sm:p-3.5 rounded-xl bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">{t('why.card2Title')}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{t('why.card2Desc')}</p>
              </CardContent>
            </Card>

            <Card className="group transition-colors border border-white/10 bg-black/10 backdrop-blur-xl hover:border-white/20">
              <CardContent className="p-5 sm:p-6 md:p-7">
                <div className="mb-4 sm:mb-5 inline-flex p-3 sm:p-3.5 rounded-xl bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-white">{t('why.card3Title')}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{t('why.card3Desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

  <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-black/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              <span className="text-white">{t('works.title1')}</span>{" "}
              <span className="gradient-text-green">{t('works.title2')}</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              {t('works.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <Card className="border border-white/10 bg-black/10 backdrop-blur-xl text-center group hover:border-white/20 transition-colors sm:col-span-2 md:col-span-1">
              <CardContent className="p-5 sm:p-6 md:p-7 space-y-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">{t('works.step1Title')}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t('works.step1Desc')}</p>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-black/10 backdrop-blur-xl text-center group hover:border-white/20 transition-colors">
              <CardContent className="p-5 sm:p-6 md:p-7 space-y-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">{t('works.step2Title')}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t('works.step2Desc')}</p>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-black/10 backdrop-blur-xl text-center group hover:border-white/20 transition-colors">
              <CardContent className="p-5 sm:p-6 md:p-7 space-y-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-primary/10 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl font-bold text-primary group-hover:bg-primary/20 transition-colors">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">{t('works.step3Title')}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t('works.step3Desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-dark">
        <div className="container mx-auto max-w-4xl">
          <Card className="border border-white/10 bg-black/10 backdrop-blur-xl">
            <CardContent className="p-6 sm:p-8 md:p-10 text-center space-y-5 md:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                <span className="gradient-text-green">{t('cta.ready')}</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto px-4">
                {user ? t('cta.authedDesc') : t('cta.guestDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
                <Link to="/search" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 group bg-primary hover:bg-primary/90 px-6 py-4 md:py-5 text-sm md:text-base">
                    {user ? t('cta.browse') : t('cta.login')}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={user ? "/form-filler" : "/signup"} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-white/10 hover:bg-white/5 px-6 py-4 md:py-5 text-sm md:text-base">
                    {user ? 'Fill Forms' : t('cta.signup')}
                    {user && <FileText className="h-4 w-4" />}
                  </Button>
                </Link>
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
