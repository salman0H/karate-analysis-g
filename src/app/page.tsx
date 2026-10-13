import { Suspense } from "react";
import { AthleteForm } from "@/components/athlete-form";
import {
  Shield,
  Zap,
  Activity,
  Cpu,
  Award,
  Layers,
  Sparkles,
  HeartPulse,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Top Club Ribbon */}
      <div className="border-b border-emerald-500/20 bg-emerald-950/30 px-4 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold">
              پایگاه سنجش و ارتقای عملکرد قهرمانی • Athletic Performance Center
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>Hardware: Xiaomi S400 Bioimpedance</span>
            <span>•</span>
            <span>AI: Groq Llama-3 Conditioning Engine</span>
          </div>
        </div>
      </div>

      {/* Main Header / Hero Section */}
      <header className="relative border-b border-slate-800/80 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-transparent py-10 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>وزارت نیرو • شرکت سهامی برق منطقه‌ای خراسان (KREC)</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 rounded-2xl bg-white/5 p-2 border border-emerald-500/30 backdrop-blur-md shadow-xl shadow-emerald-950/40">
                  <img
                    src="/images/krec-logo.png"
                    alt="لوگوی شرکت سهامی برق منطقه‌ای خراسان"
                    className="h-full w-full object-contain filter drop-shadow-md"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
                    باشگاه کاراته شرکت برق منطقه ای خراسان
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm font-semibold tracking-wide text-emerald-400 font-mono">
                    Khorasan Regional Electric Company Karate Club • Smart Body Analytics System
                  </p>
                </div>
              </div>

              {/* Technical Masters & Head Coaches Banner */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs backdrop-blur-md">
                <span className="font-bold text-amber-400">اساتید تیم:</span>
                <span className="font-bold text-white">شیهان کریمی</span>
                <span className="text-amber-400 font-bold">•</span>
                <span className="font-bold text-white">شیهان غفاری</span>
                <span className="text-amber-200/90 font-medium">
                  (اساتید تیم کاراته شرکت برق منطقه ای خراسان)
                </span>
                <span className="hidden md:inline text-[11px] text-amber-400/80 font-mono border-r border-amber-500/30 pr-2 mr-1">
                  Team Masters: Shihan Karimi & Shihan Ghaffari
                </span>
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                سامانه هوشمند پایش بیومتریک و آنالیز تخصصی ۲۵ فاکتور فیزیولوژیکی ترکیب بدنی. 
                طراحی شده جهت بهینه‌سازی توان انفجاری کومیته، پایداری استاتیک کاتا و صدور شناسنامه رسمی سلامت ورزشی.
              </p>
              <p className="text-xs text-slate-500 font-sans">
                Professional body composition intelligence evaluating Kumite explosiveness, Kata stability, and WKF division weight control.
              </p>
            </div>

            {/* Quick Status Pill Group */}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 text-right backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span>شاخص‌ها / Factors</span>
                </div>
                <div className="mt-1 text-lg font-bold text-white">۲۵ فاکتور (S400)</div>
                <div className="text-[10px] text-emerald-400">Dynamic Registry (OCP)</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 text-right backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  <span>موتور تحلیل / AI Coach</span>
                </div>
                <div className="mt-1 text-lg font-bold text-white">Groq AI</div>
                <div className="text-[10px] text-cyan-400">Llama-3 Conditioning</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interactive Form & Biometrics Console */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 text-sm text-slate-400">
              در حال بارگذاری سامانه هوشمند... Loading Smart System...
            </div>
          }
        >
          <AthleteForm />
        </Suspense>
      </main>

      {/* Official Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-400" />
            <div className="text-right sm:text-left">
              <span className="font-semibold text-slate-400 block">
                باشگاه کاراته شرکت برق منطقه ای خراسان
              </span>
              <span className="text-[10px] text-slate-600 block">
                Khorasan Regional Electric Company Karate Sports Club
              </span>
            </div>
          </div>
          <p>
            کلیه حقوق این سامانه متعلق به تربیت بدنی شرکت سهامی برق منطقه‌ای خراسان است.
          </p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>Xiaomi S400 Registry</span>
            <span>•</span>
            <span>PDF Renderer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
