"use client";

import { useEffect, useState } from "react";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import Timeline from './components/Timeline';

export default function Home() {
  // SIMULATION: Set target date to past to show fireworks
  //const targetDate = new Date().getTime() - 5000;
  const targetDate = new Date('2026-11-19T00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isReleased, setIsReleased] = useState(false);
  const { width, height } = useWindowSize();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setIsReleased(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsReleased(false);
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div
      className="flex flex-col items-center min-h-screen text-center p-8 overflow-y-auto"
      style={{
        backgroundImage: "url('/image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {isClient && isReleased && <Confetti width={width} height={height} numberOfPieces={500} recycle={true} />}

      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
        <h1
          className="text-4xl md:text-6xl font-extrabold mb-8 text-yellow-400 animate-pulse"
          style={{
            textShadow:
              "0 0 8px #a21caf, 0 0 16px #a21caf, 0 0 32px #a21caf, 0 0 64px #a21caf",
            color: "#fff",
          }}
        >
          {isReleased ? "GTA 6 IS HERE! 🚀" : "Countdown to GTA 6 🚀"}
        </h1>
        <div className="text-4xl md:text-7xl font-extrabold font-mono text-yellow-300 drop-shadow-2xl bg-black/60 backdrop-blur-sm rounded-xl px-8 py-6 my-4 border-4 border-yellow-400 shadow-2xl animate-bounce">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </div>
        <p className="mt-8 text-yellow-200 text-lg md:text-2xl font-semibold drop-shadow bg-black/40 px-4 py-2 rounded-lg">
          {isReleased ? "Out Now!" : "Coming 19th November, 2026"}
        </p>
      </div>

      <Timeline />
    </div>
  );
}