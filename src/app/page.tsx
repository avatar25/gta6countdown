"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const NEW_RELEASE = new Date("2026-11-19T00:00:00").getTime();
const OLD_RELEASE = new Date("2026-05-19T00:00:00").getTime();
const MS_IN_DAY = 1000 * 60 * 60 * 24;

export default function Home() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const delayDays = Math.max(0, Math.round((NEW_RELEASE - OLD_RELEASE) / MS_IN_DAY));

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const distance = NEW_RELEASE - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true;
      }

      setTimeLeft({
        days: Math.floor(distance / MS_IN_DAY),
        hours: Math.floor((distance % MS_IN_DAY) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });

      return false;
    };

    if (updateCountdown()) {
      return undefined;
    }

    const timer = setInterval(() => {
      if (updateCountdown()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const segments = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12 text-slate-100">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/70 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(236,72,153,0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.2),transparent_35%)]" />
        <div
          className="absolute inset-0 opacity-25 mix-blend-multiply"
          style={{
            backgroundImage: "url('/image.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(15,23,42,0.85)_0%,rgba(10,12,24,0.9)_60%,rgba(8,47,73,0.75)_100%)]" />
      </div>

      <div className="relative z-10 flex max-w-4xl flex-col gap-8 text-left">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
          <span className="h-px w-10 bg-fuchsia-500/60" />
          <span>New Date Gloom</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            GTA 6 delay watch: we were ready for May, now we stare down November.
          </h1>
          <p className="max-w-3xl text-lg text-slate-300">
            The hype train hit the brakes and added {delayDays} extra days of waiting. The neon trailer keeps looping,
            the energy dipped, but the countdown keeps crawling forward.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-6 shadow-2xl ring-1 ring-fuchsia-500/10 backdrop-blur">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Now targeting</span>
              <span className="flex items-center gap-2 text-xs text-fuchsia-200/80">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-400/80" />
                still waiting
              </span>
            </div>
            <div className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
              November 19, 2026
            </div>
            <p className="mt-2 text-sm text-slate-400">Time left until it finally drops</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {segments.map((segment) => (
                <div
                  key={segment.label}
                  className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-center shadow-inner"
                >
                  <span className="text-3xl font-semibold text-fuchsia-200 sm:text-4xl">
                    {segment.value.toString().padStart(2, "0")}
                  </span>
                  <span className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                    {segment.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm italic text-slate-400">
              It should have been spring sunshine. Instead, we get a long, cold wait.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Original promise</p>
              <p className="mt-2 text-2xl font-semibold text-slate-500 line-through decoration-2 decoration-fuchsia-400/80">
                May 19, 2026
              </p>
              <p className="mt-2 text-sm text-slate-300">Delay tax: +{delayDays} days added to the waitlist.</p>
              <div className="mt-4 text-sm text-slate-400">
                We shifted from hype to holding pattern. That sting you feel? You&apos;re not alone.
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/60 bg-gradient-to-br from-slate-900/80 via-slate-950 to-slate-900/80 p-5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Coping kit</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>- Rewatch that first trailer (again) and spot new details.</li>
                <li>- Add your backlog to the queue - might as well clear space.</li>
                <li>- Keep this page open; the countdown will keep sulking for you.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
