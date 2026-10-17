"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { heroPhotos } from "@/lib/images";
import { paymentMethods } from "@/lib/site";

const slides = [
  {
    id: "summer",
    eyebrow: "Seasonal promotion",
    title: ["POWER", "SUMMER"],
    withPower: true,
    copy: "Panels, inverters, cable, and the board gear around them. While promotional stock lasts.",
    href: "/promotions",
    cta: "Shop the promotion",
    theme: "summer",
    image: heroPhotos.summer,
  },
  {
    id: "solar",
    eyebrow: "Solar solutions",
    title: ["BACKUP", "THAT HOLDS"],
    withPower: false,
    copy: "Size the essential circuits first, then add panels and storage. We quote hybrid systems for homes and small businesses.",
    href: "/solar-solutions",
    cta: "Explore solar",
    theme: "solar",
    image: heroPhotos.solar,
  },
  {
    id: "trade",
    eyebrow: "Trade desk",
    title: ["OPEN A", "TRADE ACCOUNT"],
    withPower: false,
    copy: "Collect against an order number and keep branch invoices on one statement.",
    href: "/register",
    cta: "Create an account",
    theme: "trade",
    image: heroPhotos.trade,
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = slides[index];

  return (
    <section
      className={`hero theme-${slide.theme}`}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-slide">
        <div className="hero-copy">
          <p className="hero-eyebrow">{slide.eyebrow}</p>
          <h1 className="hero-title">
            <span>{slide.title[0]}{slide.withPower ? <PowerWord /> : null}</span>
            <span>{slide.title[1]}</span>
          </h1>
          <p className="hero-text">{slide.copy}</p>
          <Link className="hero-cta" href={slide.href}>
            {slide.cta}
          </Link>
        </div>
        <div className="hero-photo" aria-hidden="true">
          <img src={slide.image} alt="" />
        </div>
      </div>

      <div className="hero-controls">
        <button type="button" aria-label="Previous slide" onClick={() => setIndex((index + slides.length - 1) % slides.length)}>
          ‹
        </button>
        <div className="dots">
          {slides.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show slide ${dotIndex + 1}`}
              className={dotIndex === index ? "is-active" : ""}
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </div>
        <button type="button" aria-label="Next slide" onClick={() => setIndex((index + 1) % slides.length)}>
          ›
        </button>
      </div>

      <div className="pay-line">
        <span>Flexible ways to pay:</span>
        <ul>
          {paymentMethods.map((method) => (
            <li key={method}>{method}</li>
          ))}
        </ul>
      </div>
      <ul className="trust-bar">
        <li>
          <Truck /> Free delivery over R600
        </li>
        <li>
          <Lock /> Secure checkout
        </li>
        <li>
          <Pin /> Nationwide branches
        </li>
        <li>
          <Badge /> Trade accounts
        </li>
      </ul>
    </section>
  );
}

function PowerWord() {
  return (
    <span className="power-word">
      {" "}
      <i aria-hidden="true">⏻</i>N
    </span>
  );
}

function Truck() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7" cy="17.5" r="1.4" fill="currentColor" />
      <circle cx="17" cy="17.5" r="1.4" fill="currentColor" />
    </svg>
  );
}
function Lock() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function Pin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}
function Badge() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19c1.5-3 3.7-4.5 7-4.5S17.5 16 19 19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
