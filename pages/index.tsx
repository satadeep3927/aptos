import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { Geist } from "next/font/google";
import {
  Brain,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
  Clock,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/* -------------------------------------------------------------------------- */
/*                                   Data                                     */
/* -------------------------------------------------------------------------- */

const features = [
  {
    icon: Brain,
    title: "AI-Powered Practice",
    description:
      "Adaptive question engine that learns your weak areas and delivers targeted drills across all CCAT categories.",
  },
  {
    icon: Target,
    title: "Realistic Test Simulation",
    description:
      "Full-length timed mock exams that mirror the real CCAT & Wonderlic format, scoring, and pressure.",
  },
  {
    icon: Zap,
    title: "Instant Explanations",
    description:
      "Get step-by-step AI breakdowns for every question so you understand the why, not just the what.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track your progress with detailed dashboards covering speed, accuracy, and category mastery over time.",
  },
  {
    icon: Clock,
    title: "Speed Training",
    description:
      "Build pace confidence with timed micro-drills designed to improve your answers-per-minute ratio.",
  },
  {
    icon: BookOpen,
    title: "Concept Library",
    description:
      "Access a curated library of math, logic, and verbal reasoning refreshers to fill knowledge gaps fast.",
  },
];

/* -------------------------------------------------------------------------- */
/*                            Background Patterns                             */
/* -------------------------------------------------------------------------- */

function DotPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="dot-pattern"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-pattern)" />
    </svg>
  );
}

function GridPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="grid-pattern"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                      */
/* -------------------------------------------------------------------------- */

export default function Home() {
  return (
    <>
      <Head>
        <title>Aptos — AI-Driven CCAT & Wonderlic Prep</title>
        <meta
          name="description"
          content="Ace your CCAT & Wonderlic tests with AI-powered adaptive practice, realistic simulations, and instant feedback."
        />
      </Head>

      <div
        className={`${geistSans.className} min-h-screen bg-[#0a0a0a] text-white`}
      >
        {/* ---------------------------------------------------------------- */}
        {/*  Navbar                                                          */}
        {/* ---------------------------------------------------------------- */}
        <Navbar />

        {/* ---------------------------------------------------------------- */}
        {/*  Hero                                                            */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
          {/* Layered background: dot pattern + neon glow orbs */}
          <DotPattern className="text-neutral-600/25" />
          <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#E4FF30]/8 blur-[120px]" />
          <div className="pointer-events-none absolute -right-32 top-20 h-[500px] w-[500px] rounded-full bg-[#E4FF30]/5 blur-[100px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-lime-500/4 blur-[120px]" />

          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-32 text-center">
            <Badge
              variant="secondary"
              className="gap-1.5 border border-[#E4FF30]/30 bg-[#E4FF30]/10 px-4 py-1.5 text-sm font-medium text-[#E4FF30]"
            >
              <Sparkles className="size-3.5" />
              AI-Powered Test Prep
            </Badge>

            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Crush Your{" "}
              <span className="bg-linear-to-r from-[#E4FF30] via-lime-300 to-[#E4FF30] bg-clip-text text-transparent">
                CCAT & Wonderlic
              </span>{" "}
              With AI
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl">
              Adaptive practice powered by AI that identifies your weak spots,
              serves targeted drills, and gives you instant explanations — so
              you walk into test day fully prepared.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="gap-2 bg-[#E4FF30] px-8 text-base font-semibold text-neutral-900 transition-all hover:bg-[#d4ef20]"
                asChild
              >
                <a href="/auth/login?screen_hint=signup">Start Practicing Free <ArrowRight className="size-4" /></a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-neutral-700 px-8 text-base text-neutral-300 transition hover:border-[#E4FF30]/40 hover:bg-[#E4FF30]/5 hover:text-[#E4FF30]"
              >
                See How It Works
              </Button>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Features                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section id="features" className="relative scroll-mt-20 overflow-hidden border-t border-neutral-800/50 bg-[#0f0f0f]">
          <GridPattern className="text-neutral-800/40" />
          <div className="pointer-events-none absolute -right-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#E4FF30]/5 blur-[100px]" />
          <div className="pointer-events-none absolute -left-20 top-0 h-[300px] w-[300px] rounded-full bg-[#E4FF30]/3 blur-[100px]" />

          <div className="relative mx-auto max-w-6xl px-6 py-28">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge
                variant="outline"
                className="mb-4 border-[#E4FF30]/30 bg-[#E4FF30]/10 text-[#E4FF30]"
              >
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything You Need to Score Higher
              </h2>
              <p className="mt-4 text-neutral-400">
                A purpose-built platform that combines AI tutoring, realistic
                simulations, and deep analytics to maximize your score.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="group relative overflow-hidden border-neutral-800 bg-neutral-900/80 backdrop-blur-sm transition-all hover:border-[#E4FF30]/30 hover:shadow-lg hover:shadow-[#E4FF30]/5"
                >
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#E4FF30]/0 transition-all group-hover:bg-[#E4FF30]/5" />
                  <CardHeader>
                    <div className="mb-2 flex size-11 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-[#E4FF30] transition group-hover:border-[#E4FF30]/40 group-hover:shadow-sm">
                      <f.icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg text-white">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed text-neutral-400">
                      {f.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  How It Works                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="how-it-works"
          className="relative scroll-mt-20 overflow-hidden border-t border-neutral-800/50 bg-[#0a0a0a]"
        >
          <DotPattern className="text-neutral-700/25" />

          <div className="relative mx-auto max-w-5xl px-6 py-28">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge
                variant="outline"
                className="mb-4 border-[#E4FF30]/30 bg-[#E4FF30]/10 text-[#E4FF30]"
              >
                How It Works
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Three Steps to a Higher Score
              </h2>
              <p className="mt-4 text-neutral-400">
                Get started in minutes and see measurable improvement fast.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Take a Diagnostic",
                  description:
                    "Start with a quick assessment so the AI understands your baseline and weak areas.",
                },
                {
                  step: "02",
                  title: "Practice with AI",
                  description:
                    "Get targeted drills, instant explanations, and adaptive difficulty that adjusts to you.",
                },
                {
                  step: "03",
                  title: "Ace the Test",
                  description:
                    "Walk in confident with full-length simulations and a proven strategy for test day.",
                },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-lg border border-[#E4FF30]/20 bg-[#E4FF30] text-xl font-bold text-neutral-900 shadow-lg shadow-[#E4FF30]/20">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  CTA                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden border-t border-neutral-800/50">
          <div className="pointer-events-none absolute inset-0 bg-[#E4FF30]" />
          <GridPattern className="text-neutral-900/[0.07]" />
          <div className="pointer-events-none absolute -left-20 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-lime-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-0 h-[300px] w-[300px] rounded-full bg-yellow-200/20 blur-3xl" />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-28 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Ready to Beat the CCAT?
            </h2>
            <p className="max-w-xl text-neutral-800/70">
              Start practicing today with AI-driven adaptive drills — completely
              free, no credit card required.
            </p>
            <Button
              size="lg"
              className="mt-2 gap-2 bg-neutral-900 px-8 text-base font-semibold text-[#E4FF30] shadow-lg transition hover:bg-neutral-800"
              asChild
            >
              <a href="/auth/login?screen_hint=signup">Start Practicing Now <ArrowRight className="size-4" /></a>
            </Button>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Footer                                                          */}
        {/* ---------------------------------------------------------------- */}
        <footer className="border-t border-neutral-800/50 bg-[#0a0a0a]">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2.5">
              <Image
                src="/assets/images/logo.png"
                alt="Aptos logo"
                width={24}
                height={24}
                className="rounded-sm invert"
              />
              <span className="text-sm font-semibold text-white">Aptos</span>
            </div>

            <p className="text-xs text-neutral-500">
              &copy; {new Date().getFullYear()} Aptos. All rights reserved.
            </p>

            <nav className="flex gap-6 text-sm text-neutral-500">
              <a href="#" className="transition hover:text-[#E4FF30]">
                Privacy
              </a>
              <a href="#" className="transition hover:text-[#E4FF30]">
                Terms
              </a>
              <a href="#" className="transition hover:text-[#E4FF30]">
                Support
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
