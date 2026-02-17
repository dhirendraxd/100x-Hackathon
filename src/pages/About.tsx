import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink, Users, Trophy, Rocket, Github, Linkedin } from "lucide-react";
import SEO from "@/components/SEO";

const About = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEO
        title="About Form Mitra Smart"
        description="Learn about Form Mitra Smart, the 100x Hackathon project that simplifies Nepal government form discovery, document checks, and guided form completion."
        path="/about"
      />
      <ParticleBackground />
      <section className="relative min-h-[60vh] gradient-hero">
        <Navigation />
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <span className="inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-foreground/80 text-xs sm:text-sm font-medium backdrop-blur-sm mb-3">
            100x Hackathon Project
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-white">About </span>
            <span className="gradient-text-green">Form Mitra Smart</span>
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-3xl">
            Built for the 100x Hackathon, Form Mitra Smart streamlines government form discovery, guidance, and submission.
            It blends a polished React + TypeScript front‑end (Vite) with Firebase (Auth, Firestore, Storage, Cloud Functions),
            and includes an AI‑assisted experience for field hints and document checks.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/search">
              <Button size="lg" className="gap-2">Get Started</Button>
            </Link>
            <a href="https://100x-hackathon.vercel.app/" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                Live Demo
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <a href="https://github.com/dhirendraxd/100x-Hackathon" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                GitHub Repo
                <Github className="h-4 w-4" />
              </Button>
            </a>
            <a href="https://www.linkedin.com/feed/" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="gap-2">
                LinkedIn Post
                <Linkedin className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-dark">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-6">
          <Card className="border border-white/10 bg-black/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Rocket className="h-5 w-5 text-primary" />
                What it does
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3 text-sm leading-relaxed">
              <p>• Smart guidance with concise field hints to help users fill forms correctly.</p>
              <p>• Document checks and quality pre‑validation before upload.</p>
              <p>• Save progress as drafts and view submissions in a clean dashboard.</p>
              <p>• Demo Mode lets judges try everything without logging in.</p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-black/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-primary" />
                Tech highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3 text-sm leading-relaxed">
              <p>• React 18 + TypeScript + Vite + Tailwind + shadcn/ui</p>
              <p>• Firebase Auth, Firestore, Storage, Cloud Functions (Resend email)</p>
              <p>• Optional AI integrations via Hugging Face in callable functions</p>
              <p>• Location‑aware UX and polished, accessible theming</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-black/10">
        <div className="container mx-auto max-w-5xl">
          <Card className="border border-white/10 bg-black/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-primary" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 text-sm leading-relaxed">
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  <a href="https://github.com/Shishirjoshi" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Shishir
                  </a>
                </li>
                <li>
                  <a href="https://github.com/rajivsthh" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Rajiv
                  </a>
                </li>
                <li>
                  <a href="https://github.com/dhirendraxd" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Dhirendra
                  </a>
                </li>
                <li>
                  <a href="https://github.com/RitenTam" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Riten
                  </a>
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">Team: Control BIts • 100x Hackathon</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
