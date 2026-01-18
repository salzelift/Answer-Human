"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  MessageSquare,
  Play,
  Search,
  Shield,
  Sparkles,
  Star,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { getCategories } from "@/lib/get-categories";
import { getExperts } from "@/lib/get-experts";
import { Category } from "@/types/category.types";
import { KnowledgeProvider } from "@/types/expert.types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, started]);

  return { count, start: () => setStarted(true) };
}

// Intersection observer hook for animations
function useInView(threshold = 0.1) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, inView };
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredExperts, setFeaturedExperts] = useState<KnowledgeProvider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Stats with animated counters
  const statsRef = useInView(0.3);
  const expertsCounter = useCounter(2500, 2000);
  const questionsCounter = useCounter(50000, 2000);
  const countriesCounter = useCounter(120, 1500);
  const satisfactionCounter = useCounter(98, 1500);

  useEffect(() => {
    if (statsRef.inView) {
      expertsCounter.start();
      questionsCounter.start();
      countriesCounter.start();
      satisfactionCounter.start();
    }
  }, [statsRef.inView]);

  useEffect(() => {
    getCategories().then((cats) => setCategories(cats.slice(0, 8)));
    getExperts({}).then((experts) => setFeaturedExperts(experts.slice(0, 4)));
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Startup Founder",
      avatar: "SC",
      content:
        "Answer Human connected me with a patent lawyer who saved my startup from a potential lawsuit. The 15-minute consultation was worth more than months of research.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Product Designer",
      avatar: "MJ",
      content:
        "I was stuck on a complex UX problem for weeks. Found an expert here who gave me clarity in just one session. Game changer for my workflow.",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "Graduate Student",
      avatar: "PP",
      content:
        "Getting career advice from industry veterans helped me land my dream job. The mentorship I received was invaluable.",
      rating: 5,
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Post Your Question",
      description:
        "Describe what you need help with. Our AI matches you with the best experts in seconds.",
      icon: MessageSquare,
    },
    {
      step: "02",
      title: "Choose Your Expert",
      description:
        "Review profiles, ratings, and availability. Book a time that works for both of you.",
      icon: Users,
    },
    {
      step: "03",
      title: "Get Your Answer",
      description:
        "Connect via chat, call, or video. Get real solutions from real professionals.",
      icon: Zap,
    },
  ];

  const trustIndicators = [
    { icon: Shield, label: "Verified Experts", desc: "Background checked" },
    { icon: Clock, label: "24/7 Available", desc: "Global timezone coverage" },
    { icon: CheckCircle2, label: "Money-Back", desc: "Satisfaction guaranteed" },
    { icon: Globe, label: "120+ Countries", desc: "Worldwide network" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-100 rounded-full opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-emerald-100 rounded-full opacity-20" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  The Human-Powered Knowledge Engine
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                Get answers from{" "}
                <span className="relative">
                  <span className="relative z-10 text-emerald-600">real experts</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8C50 2 150 2 198 8"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-draw"
                    />
                  </svg>
                </span>
                <br />
                in minutes.
              </h1>

              <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                Skip the endless searching. Connect directly with verified professionals 
                who can solve your exact problem — right now.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="relative max-w-xl">
                <div className="flex items-center gap-3 p-2 pl-6 rounded-full border-2 border-slate-200 bg-white shadow-lg shadow-slate-200/50 focus-within:border-emerald-400 focus-within:shadow-emerald-100/50 transition-all">
                  <Search className="w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="What do you need help with?"
                    className="flex-1 border-0 bg-transparent text-lg placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="rounded-full px-6 py-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Find Expert
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>

              {/* Popular searches */}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500">Popular:</span>
                {["Legal advice", "Tax help", "Career coaching", "Tech support"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => router.push(`/explore?q=${encodeURIComponent(term)}`)}
                      className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Right side - floating cards */}
            <div className="relative hidden lg:block h-[600px]">
              {/* Main expert card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 animate-float">
                <Card className="border-0 shadow-2xl shadow-slate-200/80">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 ring-4 ring-emerald-100">
                        <AvatarImage src="/avatars/expert-1.jpg" />
                        <AvatarFallback className="bg-emerald-600 text-white text-xl">
                          AK
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">Dr. Amanda Kim</h3>
                        <p className="text-sm text-slate-500">Tax Consultant</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-amber-400 text-amber-400"
                            />
                          ))}
                          <span className="text-sm text-slate-600 ml-1">5.0</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-slate-100">
                        Tax Law
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100">
                        Small Business
                      </Badge>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900">$75</span>
                      <span className="text-slate-500">/hour</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Floating notification cards */}
              <div className="absolute top-10 right-0 animate-float-delayed">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Session completed
                      </p>
                      <p className="text-xs text-slate-500">Just now</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="absolute bottom-20 left-0 animate-float" style={{ animationDelay: "0.5s" }}>
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Video call starting
                      </p>
                      <p className="text-xs text-slate-500">with Legal Expert</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="absolute top-32 left-10 animate-float-delayed" style={{ animationDelay: "1s" }}>
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarFallback className="bg-purple-500 text-white text-xs">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          MK
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarFallback className="bg-emerald-500 text-white text-xs">
                          SR
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-sm text-slate-600">+2,847 online</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustIndicators.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section
        ref={statsRef.ref}
        className="py-20 bg-slate-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.15),transparent)]" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-5xl md:text-6xl font-bold text-emerald-400">
                {expertsCounter.count.toLocaleString()}+
              </p>
              <p className="mt-2 text-slate-400">Verified Experts</p>
            </div>
            <div className="text-center">
              <p className="text-5xl md:text-6xl font-bold text-emerald-400">
                {questionsCounter.count.toLocaleString()}+
              </p>
              <p className="mt-2 text-slate-400">Questions Answered</p>
            </div>
            <div className="text-center">
              <p className="text-5xl md:text-6xl font-bold text-emerald-400">
                {countriesCounter.count}+
              </p>
              <p className="mt-2 text-slate-400">Countries Served</p>
            </div>
            <div className="text-center">
              <p className="text-5xl md:text-6xl font-bold text-emerald-400">
                {satisfactionCounter.count}%
              </p>
              <p className="mt-2 text-slate-400">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-4">
              How it works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Get expert help in three simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, index) => (
              <div
                key={item.step}
                className="relative group"
              >
                {/* Connector line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-full h-px bg-gradient-to-r from-emerald-300 to-transparent" />
                )}
                
                <div className="relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 mt-4">
                    <item.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
              onClick={() => router.push(isAuthenticated ? "/post/new" : "/register")}
            >
              Post Your First Question
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-4">
                Browse by category
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900">
                Explore our expert categories
              </h2>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View all categories
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/explore?categories=${category.id}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${
                      ["#ecfdf5", "#f0fdf4", "#f0fdfa", "#ecfeff", "#eff6ff", "#f5f3ff", "#fdf4ff", "#fff1f2"][
                        index % 8
                      ]
                    }, transparent)`,
                  }}
                />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-white flex items-center justify-center mb-4 transition-colors">
                    <span className="text-2xl">
                      {["💼", "⚖️", "💰", "🎨", "💻", "📊", "🎓", "🏥"][index % 8]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {Math.floor(Math.random() * 200) + 50} experts
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EXPERTS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 mb-4">
                Top rated
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900">
                Featured experts
              </h2>
              <p className="text-slate-600 mt-2">
                Hand-picked professionals with exceptional track records
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Browse all experts
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredExperts.length > 0 ? (
              featuredExperts.map((expert) => (
                <Link
                  key={expert.id}
                  href={`/expert/${expert.id}`}
                  className="group"
                >
                  <Card className="border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative h-32 bg-gradient-to-br from-emerald-400 to-teal-500">
                        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10" />
                      </div>
                      <div className="p-6 pt-0 -mt-10 relative">
                        <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
                          <AvatarImage src={expert.profilePicture || undefined} />
                          <AvatarFallback className="bg-emerald-600 text-white text-2xl">
                            {expert.user?.name?.charAt(0) || "E"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="mt-3">
                          <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {expert.user?.name || "Expert"}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {expert.jobTitle || expert.industry}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium text-slate-900 ml-1">
                              {expert.rating?.toFixed(1) || "5.0"}
                            </span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <span className="text-sm text-slate-500">
                            {expert.totalReviews || 0} reviews
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {expert.skills?.slice(0, 2).map((skill, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="bg-slate-100 text-slate-600 text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-slate-900">
                              ${expert.hourlyRate || 50}
                            </span>
                            <span className="text-slate-500">/hr</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              // Skeleton loaders
              [...Array(4)].map((_, i) => (
                <Card key={i} className="border-slate-200 overflow-hidden animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-32 bg-slate-200" />
                    <div className="p-6 pt-0 -mt-10">
                      <div className="w-20 h-20 rounded-full bg-slate-300" />
                      <div className="mt-3 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Trusted by thousands
            </h2>
            <p className="text-slate-400 mt-4">
              See what our community has to say about their experience
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === activeTestimonial
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
                  }`}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur">
                    <CardContent className="p-8 md:p-12">
                      <div className="flex items-center gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-white/90">
                        "{testimonial.content}"
                      </blockquote>
                      <div className="mt-8 flex items-center gap-4">
                        <Avatar className="w-14 h-14 ring-2 ring-emerald-500/30">
                          <AvatarFallback className="bg-emerald-600 text-white">
                            {testimonial.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white">
                            {testimonial.name}
                          </p>
                          <p className="text-slate-400">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial
                      ? "w-8 bg-emerald-500"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.08),transparent)]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Ready to get your question answered?
            </h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Join thousands of people who have already found the answers they needed. 
              Your expert is just a click away.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-6 text-lg"
                onClick={() => router.push(isAuthenticated ? "/post/new" : "/register")}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-lg border-slate-300 hover:bg-slate-50"
                onClick={() => router.push("/explore")}
              >
                <Play className="w-5 h-5 mr-2" />
                Browse Experts
              </Button>
            </div>

            <p className="text-sm text-slate-500 mt-6">
              No credit card required • Free to post questions • Pay only when you book
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold">
                Answer Human
                <span className="text-emerald-500">.</span>
              </h3>
              <p className="text-slate-400 mt-4">
                The human-powered knowledge marketplace connecting seekers with verified experts.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Seekers</h4>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <Link href="/explore" className="hover:text-white transition">
                    Find Experts
                  </Link>
                </li>
                <li>
                  <Link href="/post/new" className="hover:text-white transition">
                    Post a Question
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Experts</h4>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <Link href="/expert/onboarding" className="hover:text-white transition">
                    Become an Expert
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Expert Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2026 Answer Human. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="#" className="hover:text-white transition">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white transition">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes draw {
          from {
            stroke-dasharray: 0 200;
          }
          to {
            stroke-dasharray: 200 0;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
        }
        
        .animate-draw {
          animation: draw 1.5s ease-out forwards;
          stroke-dasharray: 0 200;
        }
      `}</style>
    </div>
  );
}
