import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  PawPrint,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarCheck,
  Stethoscope,
  Heart,
  ShieldCheck,
  Sparkles,
  Bot,
  FileText,
  Users,
  Target,
  Eye,
  Check,
  UserPlus,
  BriefcaseMedical,
  Plus,
  Minus,
} from "lucide-react";

import heroPetsImg from "../assets/images/hero-pets.jpg";
import whoWeAreVetImg from "../assets/images/who-we-are-vet.jpg";
import missionPuppyImg from "../assets/images/mission-puppy.png";
import visionKittenImg from "../assets/images/cat.jpg";
import whyChooseVetImg from "../assets/images/why-choose-vet.png";
import faqDogImg from "../assets/images/faq-dog.png";
import ctaPetsImg from "../assets/images/cta-pets.jpg";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const slides = [
  {
    image: heroPetsImg,
    badge: "About VioletVet",
    title: "We Care For Pets",
    highlight: "Like Family.",
    description:
      "Creating a healthier and happier future for your beloved pets through modern veterinary care and intelligent technology.",
    imgClass: "object-cover object-[70%_25%]",
  },
  {
    image: ctaPetsImg,
    badge: "Professional Veterinary Care",
    title: "Healthy Pets.",
    highlight: "Happy Families.",
    description:
      "Connect with experienced veterinarians, organize medical records and book appointments in one convenient place.",
    imgClass: "object-cover object-[25%_25%] -scale-x-100",
  },
  {
    image: whoWeAreVetImg,
    badge: "AI Powered Pet Healthcare",
    title: "Smarter Care For",
    highlight: "Your Furry Friends.",
    description:
      "Explore AI-powered pet care guidance, manage pet profiles and stay on top of every checkup.",
    imgClass: "object-cover object-[65%_22%]",
  },
];

const whoWeAreFeatures = [
  "Pet-Friendly Healthcare",
  "Veterinary Support",
  "Modern Technology",
  "Easy Health Management",
];

const coreValues = [
  {
    icon: Heart,
    title: "Compassion",
    description: "Kindness and care for every pet.",
    filled: true,
  },
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    description: "Responsible and secure healthcare.",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description: "Modern technology for better care.",
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Easy and convenient services for everyone.",
  },
];

const whyChooseFeatures = [
  {
    icon: Stethoscope,
    title: "Expert Veterinarians",
    description: "Qualified and experienced vets.",
  },
  {
    icon: CalendarDays,
    title: "Easy Appointments",
    description: "Book, reschedule and manage.",
  },
  {
    icon: BriefcaseMedical,
    title: "Medical Records",
    description: "Keep all health data organized.",
  },
  {
    icon: Bot,
    title: "AI Pet Assistant",
    description: "Get smart pet care guidance.",
  },
];

const processSteps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Register and set up your profile.",
  },
  {
    icon: PawPrint,
    title: "Add Your Pet",
    description: "Create pet profiles with basic health details.",
  },
  {
    icon: CalendarDays,
    title: "Book Appointment",
    description: "Choose a vet and schedule a visit.",
  },
  {
    icon: FileText,
    title: "Manage Healthcare",
    description: "Access medical records and track health.",
  },
];

const stats = [
  {
    icon: Users,
    target: 10000,
    suffix: "+",
    formatLocale: true,
    fallback: "10,000+",
    label: "Happy Pet Owners",
  },
  {
    icon: PawPrint,
    target: 15000,
    suffix: "+",
    formatLocale: true,
    fallback: "15,000+",
    label: "Pets Managed",
  },
  {
    icon: Stethoscope,
    target: 150,
    suffix: "+",
    formatLocale: false,
    fallback: "150+",
    label: "Veterinarians",
  },
  {
    icon: CalendarCheck,
    target: 98,
    suffix: "%",
    formatLocale: false,
    fallback: "98%",
    label: "User Satisfaction",
  },
];

const faqs = [
  {
    question: "What is VioletVet?",
    answer:
      "VioletVet is a digital pet healthcare platform that helps pet owners manage pet profiles, book veterinary appointments, organize medical records, and get AI-powered pet care guidance.",
  },
  {
    question: "Can I add multiple pets to my account?",
    answer:
      "Yes. You can create and manage separate profiles for all of your pets from your dashboard.",
  },
  {
    question: "How can I book a veterinary appointment?",
    answer:
      "Visit the Veterinarians page, select a doctor that matches your pet's needs, and schedule an appointment in just a few clicks.",
  },
  {
    question: "Can the AI assistant diagnose my pet?",
    answer:
      "No. Our AI assistant provides helpful general pet care guidance and does not replace diagnosis or treatment from a qualified veterinarian.",
  },
];

function SectionBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFEAD1] px-3 py-1 text-xs font-semibold text-[#C25900]">
      <PawPrint size={12} className="fill-[#FF8C1A] text-[#FF8C1A]" />
      {children}
    </span>
  );
}

function HeartDoodle({ className = "" }) {
  return (
    <svg
      viewBox="0 0 64 58"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M32 50C32 50 8 35.5 8 18.5C8 10.5 14.5 5 21.5 5C26.5 5 30.2 8 32 11.5C33.8 8 37.5 5 42.5 5C49.5 5 56 10.5 56 18.5C56 35.5 32 50 32 50Z"
        stroke="#FF9825"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatStatValue(value, stat) {
  const rounded = Math.round(value);
  const formatted = stat.formatLocale
    ? rounded.toLocaleString("en-US")
    : String(rounded);
  return `${formatted}${stat.suffix}`;
}

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const containerRef = useRef(null);
  const heroContentRef = useRef(null);
  const imageRefs = useRef([]);
  const statRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Hero crossfade + Ken Burns zoom + staggered content entrance
  useGSAP(
    () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      imageRefs.current.forEach((el, idx) => {
        if (!el) return;
        gsap.to(el, {
          opacity: idx === currentSlide ? 1 : 0,
          duration: reducedMotion ? 0 : 1.1,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      });

      if (reducedMotion) return;

      const activeSlideEl = imageRefs.current[currentSlide];
      if (activeSlideEl) {
        gsap.fromTo(
          activeSlideEl,
          { scale: 1.07 },
          {
            scale: 1,
            duration: 6,
            ease: "power1.out",
            overwrite: "auto",
          }
        );
      }

      if (heroContentRef.current) {
        gsap.fromTo(
          heroContentRef.current.children,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "transform",
          }
        );
      }
    },
    { scope: containerRef, dependencies: [currentSlide], revertOnUpdate: false }
  );

  // Scroll-triggered section reveals, staggered grids, floating elements, and stat counters
  useGSAP(
    () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reducedMotion) return;

      gsap.to(".gsap-float-heart", {
        y: -7,
        rotation: 18,
        scale: 1.07,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".gsap-float-paw", {
        y: -8,
        rotation: -4,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".gsap-blob-a", {
        y: -8,
        x: 5,
        scale: 1.04,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".gsap-blob-b", {
        y: 7,
        x: -5,
        scale: 0.96,
        duration: 3.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".gsap-watermark-left", {
        y: -7,
        rotation: -6,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".gsap-watermark-right", {
        y: 7,
        rotation: 18,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.from(".gsap-who-photo", {
        opacity: 0,
        x: -36,
        scale: 0.94,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-who-photo", start: "top 90%", once: true },
      });

      gsap.from(".gsap-who-copy", {
        opacity: 0,
        x: 32,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-who-copy", start: "top 90%", once: true },
      });

      gsap.from(".gsap-who-check", {
        opacity: 0,
        y: 14,
        scale: 0.92,
        duration: 0.45,
        stagger: 0.08,
        ease: "back.out(1.4)",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-who-checklist", start: "top 92%", once: true },
      });

      gsap.from(".gsap-purpose-card", {
        opacity: 0,
        y: 28,
        scale: 0.96,
        duration: 0.7,
        stagger: 0.14,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-purpose-grid", start: "top 90%", once: true },
      });

      gsap.from(".gsap-value-card", {
        opacity: 0,
        y: 24,
        scale: 0.92,
        duration: 0.6,
        stagger: 0.09,
        ease: "back.out(1.3)",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-values-grid", start: "top 90%", once: true },
      });

      gsap.from(".gsap-why-photo", {
        opacity: 0,
        x: -32,
        scale: 0.95,
        duration: 0.75,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-why-section", start: "top 88%", once: true },
      });

      gsap.from(".gsap-why-copy", {
        opacity: 0,
        y: 20,
        duration: 0.65,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-why-section", start: "top 88%", once: true },
      });

      gsap.from(".gsap-why-item", {
        opacity: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.09,
        ease: "power2.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-why-grid", start: "top 92%", once: true },
      });

      gsap.from(".gsap-process-item", {
        opacity: 0,
        y: 22,
        scale: 0.95,
        duration: 0.5,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-process-row", start: "top 90%", once: true },
      });

      gsap.from(".gsap-stat-item", {
        opacity: 0,
        y: 20,
        duration: 0.55,
        stagger: 0.09,
        ease: "power2.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-stats-band", start: "top 92%", once: true },
      });

      stats.forEach((stat, idx) => {
        const el = statRefs.current[idx];
        if (!el) return;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: stat.target,
          duration: 1.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-stats-band",
            start: "top 92%",
            once: true,
          },
          onUpdate: () => {
            el.textContent = formatStatValue(counter.val, stat);
          },
        });
      });

      gsap.from(".gsap-faq-intro", {
        opacity: 0,
        x: -24,
        duration: 0.65,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-faq-section", start: "top 90%", once: true },
      });

      gsap.from(".gsap-faq-dog", {
        opacity: 0,
        y: 22,
        scale: 0.94,
        duration: 0.75,
        ease: "back.out(1.2)",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-faq-section", start: "top 90%", once: true },
      });

      gsap.from(".gsap-faq-card", {
        opacity: 0,
        x: 24,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "all",
        scrollTrigger: { trigger: ".gsap-faq-list", start: "top 92%", once: true },
      });

      gsap.utils.toArray(".home-reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.65,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            once: true,
          },
        });
      });
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      if (
        openFaq === null ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        ScrollTrigger.refresh();
        return;
      }

      gsap.from(".gsap-faq-answer", {
        opacity: 0,
        y: -8,
        duration: 0.28,
        ease: "power2.out",
        clearProps: "all",
      });
      ScrollTrigger.refresh();
    },
    { scope: containerRef, dependencies: [openFaq] }
  );

  const activeSlide = slides[currentSlide];

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-[#FFFBF5] text-[#2D3138]"
    >
      {/* ========================================
                    HERO BANNER SLIDER
      ======================================== */}
      <section
        aria-label="Pet healthcare highlights"
        className="relative flex min-h-[calc(100svh-65px)] w-full items-center overflow-hidden bg-[#1D150E]"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.badge}
            ref={(el) => {
              imageRefs.current[index] = el;
            }}
            className="absolute inset-0 h-full w-full will-change-transform"
            style={{ opacity: index === 0 ? 1 : 0 }}
            aria-hidden="true"
          >
            <img
              src={slide.image}
              alt=""
              loading="eager"
              fetchPriority={index === 0 ? "high" : "auto"}
              className={`h-full w-full ${slide.imgClass}`}
            />
          </div>
        ))}

        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#17110B]/95 via-[#17110B]/65 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-transparent to-black/15" />

        <HeartDoodle className="gsap-float-heart pointer-events-none absolute right-[10%] top-[32%] z-20 hidden h-9 w-9 rotate-12 opacity-80 lg:block" />

        <div className="relative z-20 mx-auto w-full max-w-6xl px-12 py-10 sm:px-16 lg:px-10 lg:py-12">
          <div ref={heroContentRef} className="max-w-lg">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFEAD1] px-3 py-1 text-xs font-semibold text-[#C25900] shadow-sm">
              <PawPrint
                size={12}
                className="fill-[#FF8C1A] text-[#FF8C1A]"
              />
              {activeSlide.badge}
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
              {activeSlide.title}
              <span className="mt-1 block text-[#FF9825]">
                {activeSlide.highlight}
              </span>
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">
              {activeSlide.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/doctors"
                className="group inline-flex items-center gap-2 rounded-full bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#FFA242]"
              >
                <CalendarDays size={16} />
                Book Appointment
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-black/35 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#2D3138]"
              >
                <PawPrint size={16} />
                Our Services
              </Link>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-3.5 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white p-0 text-[#2D3138] shadow-md transition hover:scale-105 hover:bg-[#FF8C1A] hover:text-white"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-3.5 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white p-0 text-[#2D3138] shadow-md transition hover:scale-105 hover:bg-[#FF8C1A] hover:text-white"
        >
          <ChevronRight size={18} />
        </button>

        <div className="absolute bottom-3.5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.badge}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full p-0 transition-all ${
                currentSlide === index
                  ? "w-6 bg-[#FF8C1A]"
                  : "w-2.5 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ========================================
             WHO WE ARE + MISSION & VISION
      ======================================== */}
      <section className="mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Organic Blob Photo + Decorative Paw */}
          <div className="gsap-who-photo relative mx-auto w-full max-w-[400px] lg:col-span-5">
            <div
              aria-hidden="true"
              className="gsap-float-paw pointer-events-none absolute -left-3 -top-3 z-10 -rotate-12 text-[#FFB347]"
            >
              <PawPrint size={46} className="fill-[#FFB347]/85 text-[#FFB347]" />
            </div>

            <div className="group relative overflow-hidden rounded-[48%_52%_55%_45%/46%_54%_46%_54%] border-4 border-white bg-[#FFEAD1] shadow-lg">
              <img
                src={whoWeAreVetImg}
                alt="Veterinarian hugging a happy golden retriever"
                loading="lazy"
                className="h-[250px] w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 sm:h-[275px]"
              />
            </div>
          </div>

          {/* Who We Are Copy */}
          <div className="gsap-who-copy lg:col-span-7">
            <SectionBadge>Who We Are</SectionBadge>

            <h2 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-tight text-[#22262E] sm:text-3xl lg:text-[34px]">
              A Better Life For
              <span className="block text-[#F27A15]">Every Beloved Pet.</span>
            </h2>

            <p className="mt-2.5 text-sm leading-6 text-[#5C6470]">
              VioletVet is a modern pet healthcare platform that helps pet
              owners manage appointments, medical records and AI-powered pet
              care guidance in one convenient place.
            </p>

            <div className="gsap-who-checklist mt-4 grid grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2">
              {whoWeAreFeatures.map((item) => (
                <div
                  key={item}
                  className="gsap-who-check flex items-center gap-2 text-sm font-semibold text-[#2D3138]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF8C1A] text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="gsap-purpose-grid mt-7 grid gap-4 lg:grid-cols-2 lg:gap-5">
          {/* Our Mission */}
          <div className="gsap-purpose-card group flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-[#F5E2CA] bg-gradient-to-br from-[#FFF6EA] to-[#FFEDD6] px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="max-w-[66%]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFE0B8] text-[#E66B00] transition-transform duration-300 group-hover:scale-110">
                  <Target size={18} />
                </span>
                <h3 className="text-base font-bold text-[#22262E] sm:text-lg">
                  Our Mission
                </h3>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#5C6470] sm:text-[13px]">
                To simplify pet healthcare by providing an accessible platform
                where pet owners can organize health information and connect
                with veterinarians.
              </p>
            </div>
            <div className="shrink-0 self-end">
              <img
                src={missionPuppyImg}
                alt="Cute golden retriever puppy"
                loading="lazy"
                className="h-24 w-24 object-contain transition-transform duration-500 [mask-image:linear-gradient(to_bottom,black_88%,transparent_100%)] group-hover:scale-105 sm:h-28 sm:w-28"
              />
            </div>
          </div>

          {/* Our Vision */}
          <div className="gsap-purpose-card group flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-[#F5E2CA] bg-gradient-to-br from-[#FFF6EA] to-[#FFEDD6] px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="max-w-[66%]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFE0B8] text-[#E66B00] transition-transform duration-300 group-hover:scale-110">
                  <Eye size={18} />
                </span>
                <h3 className="text-base font-bold text-[#22262E] sm:text-lg">
                  Our Vision
                </h3>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#5C6470] sm:text-[13px]">
                To build a future where every pet has access to compassionate
                care and pet owners feel informed and supported.
              </p>
            </div>
            <div className="shrink-0 self-end">
              <img
                src={visionKittenImg}
                alt="Cute kitten looking up"
                loading="lazy"
                className="h-24 w-24 object-contain mix-blend-multiply transition-transform duration-500 [mask-image:radial-gradient(ellipse_at_55%_55%,black_58%,transparent_94%)] group-hover:scale-105 sm:h-28 sm:w-28"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
                  OUR CORE VALUES
      ======================================== */}
      <section className="border-y border-[#F4EAE0] bg-white py-7 lg:py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="home-reveal">
            <SectionBadge>Our Core Values</SectionBadge>
          </div>

          <div className="gsap-values-grid mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-6">
            {coreValues.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="gsap-value-card group flex flex-col items-center px-2"
                >
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4E5] text-[#FF8C1A] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                    <Icon
                      size={23}
                      className={val.filled ? "fill-[#FF8C1A] text-[#FF8C1A]" : ""}
                    />
                  </div>
                  <h3 className="text-sm font-bold text-[#22262E] sm:text-base">
                    {val.title}
                  </h3>
                  <p className="mt-1 max-w-[185px] text-xs leading-5 text-[#5C6470]">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================
               WHY CHOOSE VIOLETVET?
      ======================================== */}
      <section className="gsap-why-section bg-gradient-to-r from-[#FFF7EC] via-[#FFFBF5] to-[#FFF5E8] py-8 lg:py-9">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Illustration + Vet Photo */}
          <div className="gsap-why-photo relative mx-auto flex w-full max-w-[330px] items-center justify-center lg:col-span-5">
            <div
              aria-hidden="true"
              className="gsap-blob-a absolute -left-2 top-6 h-36 w-36 rounded-[62%_38%_46%_54%/60%_44%_56%_40%] bg-[#FFE2B8]/70"
            />
            <div
              aria-hidden="true"
              className="gsap-blob-b absolute bottom-6 right-2 h-24 w-24 rounded-[42%_58%_50%_50%/48%_52%_48%_52%] bg-[#FF9825]/80"
            />
            <img
              src={whyChooseVetImg}
              alt="Experienced male veterinarian examining a beagle"
              loading="lazy"
              className="relative z-10 h-[230px] w-full object-contain [mask-image:linear-gradient(to_bottom,black_84%,transparent_100%)] sm:h-[260px]"
            />
          </div>

          {/* Right Features Grid */}
          <div className="lg:col-span-7">
            <div className="gsap-why-copy">
              <SectionBadge>Why Choose VioletVet?</SectionBadge>

              <h2 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-tight text-[#22262E] sm:text-3xl lg:text-[34px]">
                More Than Just{" "}
                <span className="text-[#F27A15]">Pet Healthcare.</span>
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#5C6470]">
                Everything you need to organize your pet&apos;s healthcare journey
                in one convenient place.
              </p>
            </div>

            <div className="gsap-why-grid mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {whyChooseFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="gsap-why-item group flex items-start gap-2.5"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E67300] transition-transform duration-300 group-hover:scale-110">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#22262E]">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-xs leading-5 text-[#5C6470]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
             SIMPLE PROCESS — HOW IT WORKS
      ======================================== */}
      <section className="mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="home-reveal text-center">
          <SectionBadge>Simple Process</SectionBadge>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#22262E] sm:text-3xl">
            How It Works
          </h2>
          <p className="mt-1 text-xs text-[#5C6470] sm:text-sm">
            Get started in four simple steps.
          </p>
        </div>

        <div className="gsap-process-row mt-6 flex flex-col items-stretch justify-between gap-3 lg:flex-row">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.title}>
                <div className="gsap-process-item group flex flex-1 flex-col items-center justify-center rounded-2xl border border-[#F3E5D3] bg-white px-4 py-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD39E] hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00] transition-transform duration-300 group-hover:scale-110">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-[#22262E]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#5C6470]">
                    {step.description}
                  </p>
                </div>

                {index < processSteps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="gsap-process-item hidden shrink-0 items-center justify-center self-center text-[#9CA3AF] lg:flex"
                  >
                    <ArrowRight size={16} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* ========================================
                 ORANGE STATS BANNER
      ======================================== */}
      <section className="gsap-stats-band relative overflow-hidden bg-gradient-to-r from-[#FF8F1F] via-[#FF7B00] to-[#F57600] py-6 text-white">
        <PawPrint
          size={95}
          aria-hidden="true"
          className="gsap-watermark-left pointer-events-none absolute -left-3 top-1/2 -translate-y-1/2 -rotate-12 fill-white/10 text-white/10"
        />
        <PawPrint
          size={95}
          aria-hidden="true"
          className="gsap-watermark-right pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 rotate-12 fill-white/10 text-white/10"
        />

        <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="gsap-stat-item flex items-center justify-center gap-3"
              >
                <Icon size={27} className="shrink-0 text-white/95" />
                <div>
                  <div
                    ref={(el) => {
                      statRefs.current[idx] = el;
                    }}
                    className="text-lg font-extrabold leading-tight tabular-nums sm:text-xl"
                  >
                    {stat.fallback}
                  </div>
                  <div className="text-[11px] font-medium text-white/90 sm:text-xs">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================
             FAQS — FREQUENTLY ASKED QUESTIONS
      ======================================== */}
      <section className="gsap-faq-section mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="grid items-center gap-6 lg:grid-cols-12">
          {/* Left Heading */}
          <div className="gsap-faq-intro lg:col-span-3">
            <SectionBadge>FAQs</SectionBadge>
            <h2 className="mt-2.5 text-2xl font-extrabold leading-snug tracking-tight text-[#22262E]">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#5C6470] sm:text-sm">
              Find answers to common questions about VioletVet.
            </p>
          </div>

          {/* Center Happy Lying Dog */}
          <div className="gsap-faq-dog flex justify-center lg:col-span-4">
            <img
              src={faqDogImg}
              alt="Smiling golden retriever lying down"
              loading="lazy"
              className="h-[160px] w-full max-w-[260px] object-contain sm:h-[180px]"
            />
          </div>

          {/* Right Accordion List */}
          <div className="gsap-faq-list space-y-2.5 lg:col-span-5">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.question}
                  className="gsap-faq-card overflow-hidden rounded-xl border border-[#EFE2D0] bg-white shadow-sm transition hover:border-[#FFD39E]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-left text-sm font-bold text-[#22262E] transition hover:bg-[#FFF9F2]"
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <Minus size={15} className="shrink-0 text-[#E67300]" />
                    ) : (
                      <Plus size={15} className="shrink-0 text-[#22262E]" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="gsap-faq-answer border-t border-[#F7EDE0] px-4 pb-3 pt-2.5 text-xs leading-5 text-[#5C6470]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================
                 BOTTOM CTA BANNER
      ======================================== */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="home-reveal relative flex min-h-[210px] items-center overflow-hidden rounded-[22px] bg-[#2D1A08] shadow-xl">
          <img
            src={ctaPetsImg}
            alt="Happy Corgi dog and grey tabby cat"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[20%_center]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-[#3D220A]/80 to-[#2A1605]/95" />

          <HeartDoodle className="gsap-float-heart pointer-events-none absolute left-[41%] top-[26%] z-10 hidden h-7 w-7 rotate-12 opacity-80 lg:block" />

          <div className="relative z-10 ml-auto w-full p-6 text-white sm:p-8 lg:w-[54%]">
            <h2 className="text-xl font-extrabold leading-tight sm:text-2xl lg:text-3xl">
              <span className="inline-flex items-center gap-2">
                <PawPrint
                  size={18}
                  className="shrink-0 fill-[#FF9825] text-[#FF9825]"
                />
                Let&apos;s Make Your Pet&apos;s Life
              </span>
              <span className="mt-0.5 block text-[#FF9825]">
                Happier &amp; Healthier.
              </span>
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/85 sm:text-sm">
              Start your pet&apos;s healthcare journey with VioletVet today.
            </p>

            <Link
              to="/doctors"
              className="group mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#FFA242]"
            >
              <CalendarDays size={16} />
              Book Appointment
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
