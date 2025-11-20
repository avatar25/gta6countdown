"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const targetDate = new Date('2026-11-19T00:00:00').getTime(); // GTA 6 (example date)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center p-8"
      style={{
        backgroundImage: "url('/image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1
        className="text-4xl font-extrabold mb-8 text-yellow-400 animate-pulse"
        style={{
          textShadow:
            "0 0 8px #a21caf, 0 0 16px #a21caf, 0 0 32px #a21caf, 0 0 64px #a21caf",
          color: "#fff",
        }}
      >
        Countdown to GTA 6 🚀
      </h1>
      <div className="text-6xl font-extrabold font-mono text-yellow-300 drop-shadow-2xl bg-black/40 rounded-xl px-8 py-4 my-4 border-4 border-yellow-400 shadow-2xl animate-bounce">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </div>
      <p className="mt-8 text-yellow-200 text-lg font-semibold drop-shadow">
        Coming 19th November, 2026
      </p>
    </div>
  );
}