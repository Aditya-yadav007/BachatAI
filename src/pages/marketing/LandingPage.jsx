import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Lightweight inline icons (Heroicons-like), no extra deps
const IconSparkles = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 7.5 21l-2.313-5.096L0 13.5l5.187-2.404L7.5 6l2.313 5.096L15 13.5l-5.187 2.404zM18 8l1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>
  </svg>
);
const IconBell = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
  </svg>
);
const IconDocument = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6"/>
  </svg>
);
const IconShield = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
  </svg>
);
const IconUserPlus = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 14a4 4 0 10-8 0m8 0v1a4 4 0 01-4 4H8a4 4 0 01-4-4v-1m14-7h3m-1.5-1.5V9"/>
  </svg>
);
const IconUpload = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4"/>
  </svg>
);

const features = [
  {
    title: "Smart Insights",
    desc: "AI-powered analytics to understand your spending and saving patterns.",
    icon: IconSparkles,
  },
  {
    title: "Budgets & Alerts",
    desc: "Create budgets and get notified when you cross defined limits.",
    icon: IconBell,
  },
  {
    title: "Bank Statements",
    desc: "Upload statements, parse them instantly, and view clean summaries.",
    icon: IconDocument,
  },
  {
    title: "Secure & Private",
    desc: "Backed by Firebase Auth and Realtime Database with strict rules.",
    icon: IconShield,
  },
];

const LandingPage = () => {
  // Simple slider data
  const slides = [
    {
      title: "Understand your spending",
      desc: "Visualize where your money goes each month and find ways to save.",
      img: "https://static.fmgsuite.com/media/ContentFMG/variantSize/dd922c2f-1e31-44f1-ac09-2abb72e6ee03.jpg?v=1",
    },
    {
      title: "Upload statements instantly",
      desc: "Drop your CSVs and we’ll categorize and summarize them for you.",
      img: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Stay on budget",
      desc: "Create goals and get alerts when you’re close to crossing limits.",
      img: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?q=80&w=1200&auto=format&fit=crop",
    },
  ];
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-500" />
            <span className="text-slate-800 font-semibold">Bachat AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100">Login</Link>
            <Link to="/register" className="text-sm px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600">Sign up</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold">Smarter finance, simply</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Track, analyze, and save more with Bachat AI
            </h1>
            <p className="mt-3 text-slate-600">
              Upload bank statements, get instant insights, set budgets, and make informed decisions—
              all in a clean, modern dashboard.
            </p>
            <div className="mt-5 flex gap-3">
              <Link to="/register" className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600">
                Get Started Free
              </Link>
              <Link to="/login" className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-100">
                Demo Login
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="h-56 md:h-72 rounded-lg overflow-hidden">
                <img
                  src="/dashboard-preview.png"
                  alt="Bachat AI dashboard preview"
                  className="w-full h-full object-contain bg-slate-50"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slider */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Slides */}
            <div className="relative h-[280px] md:h-[360px]">
              {slides.map((s, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-500 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
                >
                  <div className="relative h-full">
                    {/* Image */}
                    <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                    {/* Overlay gradient for readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent" />
                    {/* Content on image */}
                    <div className="relative h-full flex items-center">
                      <div className="px-5 md:px-8 max-w-xl">
                        <h3 className="text-xl md:text-2xl font-semibold text-white">{s.title}</h3>
                        <p className="mt-2 text-white/90 text-sm md:text-base">{s.desc}</p>
                        <div className="mt-4 flex gap-2">
                          <Link to="/register" className="text-xs px-3 py-1.5 rounded-lg bg-white text-brand-600 hover:bg-slate-100">Get started</Link>
                          <Link to="/login" className="text-xs px-3 py-1.5 rounded-lg border border-white/70 text-white hover:bg-white/10">Demo login</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <button
              aria-label="Previous"
              onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-slate-200 shadow flex items-center justify-center text-slate-700 hover:bg-white"
            >
              ◀
            </button>
            <button
              aria-label="Next"
              onClick={() => setCurrent((c) => (c + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-slate-200 shadow flex items-center justify-center text-slate-700 hover:bg-white"
            >
              ▶
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 w-2.5 rounded-full ${i === current ? "bg-brand-600" : "bg-slate-300"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 md:py-16 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-slate-900">Why Bachat AI?</h2>
          <p className="text-slate-600 text-sm mt-1">Tools that help you take control of your money.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow transition">
                  <div className="h-10 w-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium text-slate-800">{f.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-slate-900">Do more with Bachat AI</h2>
          <p className="text-slate-600 text-sm mt-1">Quick actions you can take once you sign in.</p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[ 
              { t: "Overview", d: "See balances, recent activity and quick stats in one place.", icon: IconSparkles },
              { t: "Transactions", d: "Add, view and manage all your incomes and expenses.", icon: IconDocument },
              { t: "Budgets", d: "Create monthly budgets and get alerts when crossing limits.", icon: IconBell },
              { t: "Insights", d: "Get AI-driven tips to optimize your spending and savings.", icon: IconShield },
            ].map((c, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition flex flex-col">
                <div className="h-10 w-10 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                  {(() => { const CardIcon = c.icon; return <CardIcon className="h-5 w-5" />; })()}
                </div>
                <p className="font-semibold text-slate-800">{c.t}</p>
                <p className="mt-1 text-sm text-slate-600 flex-1">{c.d}</p>
                <div className="mt-4">
                  <Link to="/login" className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100">Try now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[
            {t: "Create account", d: "Sign up in seconds with email & password.", icon: IconUserPlus},
            {t: "Upload statements", d: "CSV statements are parsed and categorized.", icon: IconUpload},
            {t: "Get insights", d: "See trends, budgets, and suggestions instantly.", icon: IconSparkles},
          ].map((s, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                  {(() => { const StepIcon = s.icon; return <StepIcon className="h-4 w-4" />; })()}
                </div>
                <p className="text-xs text-slate-500">Step {i+1}</p>
              </div>
              <p className="mt-2 font-semibold text-slate-800">{s.t}</p>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-brand-600 to-brand-500 text-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">Ready to start saving smarter?</p>
            <p className="text-sm text-white/90">Join Bachat AI today — it’s free and takes under a minute.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/register" className="px-4 py-2 rounded-lg bg-white text-brand-600 text-sm font-semibold hover:bg-slate-100">Create account</Link>
            <Link to="/login" className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm font-medium hover:bg-white/10">Login</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Bachat AI. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <a href="#" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
