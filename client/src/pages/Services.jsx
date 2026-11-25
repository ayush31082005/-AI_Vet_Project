import React, { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  PawPrint,
  ArrowRight,
  ChevronRight,
  CalendarDays,
  CalendarCheck,
  Stethoscope,
  Bot,
  FileText,
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
  UserPlus,
  Clock,
  Check,
} from "lucide-react";

import heroPetsImg from "../assets/images/hero-pets.jpg";
import whoWeAreVetImg from "../assets/images/who-we-are-vet.jpg";
import whyChooseVetImg from "../assets/images/why-choose-vet.png";
import ctaPetsImg from "../assets/images/cta-pets.jpg";
import dogImg from "../assets/images/dog.jpg";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const serviceList = [
  {
    icon: Stethoscope,
    title: "Veterinary Consultation",
    description:
      "Connect with qualified veterinary doctors for checkups, diagnoses, and personalized treatment plans.",
    highlights: ["Verified Vets", "Routine & Follow-up Visits"],
    image: whoWeAreVetImg,
    fallback: heroPetsImg,
    path: "/doctors",
    cta: "Find Veterinarians",
  },
  {
    icon: CalendarDays,
    title: "Appointment Booking",
    description:
      "Schedule, reschedule, and track upcoming veterinary visits seamlessly from your dashboard.",
    highlights: ["Instant Slot Selection", "Easy Rescheduling"],
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&fit=crop&auto=format",
    fallback: heroPetsImg,
    path: "/app/appointments",
    cta: "Book Appointment",
  },
  {
    icon: PawPrint,
    title: "Pet Profile Management",
    description:
      "Maintain dedicated profiles for all your pets with breed, age, weight, and care preferences.",
    highlights: ["Multiple Pet Profiles", "Quick Health Summary"],
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&fit=crop&auto=format",
    fallback: dogImg,
    path: "/app/pets",
    cta: "Manage Pets",
  },
  {
    icon: FileText,
    title: "Digital Medical Records",
    description:
      "Keep prescriptions, vaccination logs, lab reports, and past visit summaries organized in one place.",
    highlights: ["Digital Prescriptions", "Vaccination History"],
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&fit=crop&auto=format",
    fallback: ctaPetsImg,
    path: "/app/medical",
    cta: "View Records",
  },
  {
    icon: Bot,
    title: "AI Pet Assistant",
    description:
      "Get instant, intelligent pet care guidance on nutrition, grooming, daily habits, and symptom checks.",
    highlights: ["24/7 Smart Guidance", "Nutrition & Care Tips"],
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&fit=crop&auto=format",
    fallback: ctaPetsImg,
    path: "/app/ai",
    cta: "Start AI Chat",
  },
  {
    icon: Heart,
    title: "Preventive Wellness Care",
    description:
      "Stay ahead with preventive checkup reminders, diet guidance, and tailored wellness routines.",
    highlights: ["Wellness Checklists", "Preventive Support"],
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&fit=crop&auto=format",
    fallback: heroPetsImg,
    path: "/doctors",
    cta: "Explore Wellness",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    description: "Experienced veterinary specialists.",
  },
  {
    icon: Clock,
    title: "Quick Scheduling",
    description: "Book visits in seconds.",
  },
  {
    icon: FileText,
    title: "Centralized Records",
    description: "Everything stored safely online.",
  },
  {
    icon: Sparkles,
    title: "AI Care Support",
    description: "Smart answers whenever you need.",
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

export function Services() {
  const containerRef = useRef(null);
  const heroContentRef = useRef(null);
  const statRefs = useRef([]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      if (heroContentRef.current) {
        gsap.from(heroContentRef.current.children, {
          opacity: 0,
          y: 24,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all",
        });
      }

      gsap.from(".gsap-hero-bg", {
        scale: 1.07,
        duration: 5,
        ease: "power1.out",
      });

      gsap.to(".gsap-float-heart", {
        y: -7,
        rotation: 18,
        scale: 1.07,
        duration: 2.6,
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

      gsap.from(".gsap-service-card", {
        opacity: 0,
        y: 26,
        scale: 0.96,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-services-grid",
          start: "top 90%",
          once: true,
        },
      });

      gsap.from(".gsap-why-photo", {
        opacity: 0,
        x: -32,
        scale: 0.95,
        duration: 0.75,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-why-section",
          start: "top 88%",
          once: true,
        },
      });

      gsap.from(".gsap-why-item", {
        opacity: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.09,
        ease: "power2.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-why-grid",
          start: "top 92%",
          once: true,
        },
      });

      gsap.from(".gsap-process-item", {
        opacity: 0,
        y: 22,
        scale: 0.95,
        duration: 0.5,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-process-row",
          start: "top 90%",
          once: true,
        },
      });

      gsap.from(".gsap-stat-item", {
        opacity: 0,
        y: 20,
        duration: 0.55,
        stagger: 0.09,
        ease: "power2.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-stats-band",
          start: "top 92%",
          once: true,
        },
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

      gsap.utils.toArray(".services-reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.65,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-[#FFFBF5] text-[#2D3138]"
    >
      {/* HERO BANNER */}
      <section className="relative flex min-h-[calc(100svh-65px)] w-full items-center overflow-hidden bg-[#1D150E]">
        <img
          src={whoWeAreVetImg}
          alt=""
          loading="eager"
          className="gsap-hero-bg absolute inset-0 h-full w-full object-cover object-[65%_22%]"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#17110B]/95 via-[#17110B]/72 to-[#17110B]/25" />
        <HeartDoodle className="gsap-float-heart pointer-events-none absolute right-[10%] top-[28%] z-20 hidden h-9 w-9 rotate-12 opacity-80 lg:block" />

        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
          <div ref={heroContentRef} className="max-w-lg">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFEAD1] px-3 py-1 text-xs font-semibold text-[#C25900]">
              <PawPrint
                size={12}
                className="fill-[#FF8C1A] text-[#FF8C1A]"
              />
              Our Services
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
              Complete Care For
              <span className="mt-1 block text-[#FF9825]">
                Your Beloved Pets.
              </span>
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">
              Everything your furry friends need — from veterinary consultations
              and appointment booking to medical records and AI pet care
              guidance.
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
                to="/app/ai"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-black/35 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#2D3138]"
              >
                <Bot size={16} />
                AI Pet Assistant
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-white/75">
              <Link to="/" className="hover:text-[#FF9825]">
                Home
              </Link>
              <ChevronRight size={13} />
              <span className="font-semibold text-[#FF9825]">Services</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE SERVICES GRID */}
      <section className="mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="services-reveal text-center">
          <SectionBadge>What We Offer</SectionBadge>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#22262E] sm:text-3xl">
            Healthcare Services For{" "}
            <span className="text-[#F27A15]">Every Paw</span>
          </h2>
          <p className="mt-1 text-xs text-[#5C6470] sm:text-sm">
            Designed to keep every pet healthy, happy, and well cared for.
          </p>
        </div>

        <div className="gsap-services-grid mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {serviceList.map((service) => (
            <article
              key={service.title}
              className="gsap-service-card group flex flex-col overflow-hidden rounded-2xl border border-[#F3E5D3] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD39E] hover:shadow-md"
            >
              <div className="relative h-44 overflow-hidden bg-[#FFEAD1]">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = service.fallback;
                  }}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="text-base font-bold text-[#22262E] sm:text-lg">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#5C6470] sm:text-[13px]">
                    {service.description}
                  </p>

                  <div className="mt-3 space-y-1.5">
                    {service.highlights.map((pt) => (
                      <div
                        key={pt}
                        className="flex items-center gap-2 text-xs font-semibold text-[#2D3138]"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FF8C1A] text-white">
                          <Check size={10} strokeWidth={3} />
                        </span>
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={service.path}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#D96B08] transition hover:text-[#B45309] sm:text-sm"
                >
                  {service.cta}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE OUR SERVICES */}
      <section className="gsap-why-section border-y border-[#F4EAE0] bg-gradient-to-r from-[#FFF7EC] via-[#FFFBF5] to-[#FFF5E8] py-8 lg:py-9">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 lg:grid-cols-12 lg:gap-8">
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
              alt="Veterinarian caring for a beagle"
              loading="lazy"
              className="relative z-10 h-[230px] w-full object-contain [mask-image:linear-gradient(to_bottom,black_84%,transparent_100%)] sm:h-[260px]"
            />
          </div>

          <div className="lg:col-span-7">
            <div className="services-reveal">
              <SectionBadge>Service Promise</SectionBadge>
              <h2 className="mt-2.5 text-2xl font-extrabold leading-tight tracking-tight text-[#22262E] sm:text-3xl">
                Trusted Care With{" "}
                <span className="text-[#F27A15]">Smart Convenience.</span>
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5C6470]">
                Every service on VioletVet is built around comfort, clarity, and
                easy access for pet parents.
              </p>
            </div>

            <div className="gsap-why-grid mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              {guarantees.map((item) => {
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

      {/* SIMPLE PROCESS */}
      <section className="mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="services-reveal text-center">
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

      {/* STATS BANNER */}
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

      {/* BOTTOM CTA BANNER */}
      <section className="mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="services-reveal relative flex min-h-[210px] items-center overflow-hidden rounded-[22px] bg-[#2D1A08] shadow-xl">
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
                Ready To Care Better
              </span>
              <span className="mt-0.5 block text-[#FF9825]">
                For Your Beloved Pet?
              </span>
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/85 sm:text-sm">
              Choose a service or book a veterinary consultation in seconds.
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

export default Services;
