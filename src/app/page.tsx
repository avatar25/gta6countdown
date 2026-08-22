"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import Timeline from './components/Timeline';
import { target } from '@/lib/events';

const backgrounds = [
  { src: "/image.png", alt: "GTA VI key art featuring Lucia and Jason" },
  { src: "/screenshots/ULTIMATE_EDITION_02.jpg", alt: "GTA VI Ultimate Edition screenshot" },
  { src: "/screenshots/ULTIMATE_EDITION_SQUALO_04.jpg", alt: "GTA VI Squalo screenshot" },
  { src: "/screenshots/ULTIMATE_EDITION_WYMAN_CAR_COLLECTION_01.jpg", alt: "GTA VI Wyman car collection screenshot" },
  { src: "/screenshots/VINTAGE_VICE_CITY_PACK_01.jpg", alt: "GTA VI Vintage Vice City Pack screenshot" },
  { src: "/screenshots/VINTAGE_VICE_CITY_PACK_02.jpg", alt: "GTA VI Vintage Vice City Pack screenshot" },
];

export default function Home() {
  // SIMULATION: Set target date to past to show fireworks
  //const targetDate = new Date().getTime() - 5000;
  // Driven by data/target.json, which the storefront watchers keep honest.
  const targetDate = new Date(target.releaseDate).getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isReleased, setIsReleased] = useState(false);
  const { width, height } = useWindowSize();
  const [isClient, setIsClient] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

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

  useEffect(() => {
    const slideshow = window.setInterval(() => {
      setBackgroundIndex((current) => (current + 1) % backgrounds.length);
    }, 8000);

    return () => window.clearInterval(slideshow);
  }, []);

  return (
    <div className="relative isolate flex min-h-screen flex-col items-center overflow-hidden p-8 text-center">
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-black"
        style={{ backgroundImage: "url('/image.png')" }}
        aria-hidden="true"
      >
        {backgrounds.map((background, index) => (
          <Image
            key={background.src}
            src={background.src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={`background-slide object-cover ${
              backgroundIndex === index ? "background-slide-active" : ""
            }`}
          />
        ))}
      </div>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/20 via-black/5 to-black/45" aria-hidden="true" />

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
          {isReleased
            ? `${target.shortName} IS HERE!`
            : `Countdown to ${target.shortName}`}
        </h1>
        <div className="countdown-neon my-4 rounded-xl px-5 py-6 font-mono text-4xl font-extrabold tabular-nums md:px-8 md:text-7xl">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </div>
        <p className="mt-8 text-yellow-200 text-lg md:text-2xl font-semibold drop-shadow bg-black/40 px-4 py-2 rounded-lg">
          {isReleased ? "Out Now!" : `Coming ${target.releaseDateLabel}`}
        </p>
        <a
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/45 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-yellow-300 hover:text-yellow-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300"
          href="https://www.rockstargames.com/VI/media/screenshots"
          target="_blank"
          rel="noreferrer"
        >
          View official screenshots
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <Timeline />
    </div>
  );
}
