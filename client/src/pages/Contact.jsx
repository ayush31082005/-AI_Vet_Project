import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  PawPrint,
  ArrowRight,
  ChevronRight,
  CalendarDays,
  Stethoscope,
  Bot,
  Mail,
  Phone,
  Clock,
  ShieldAlert,
  Send,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react";

import whoWeAreVetImg from "../assets/images/who-we-are-vet.jpg";
import faqDogImg from "../assets/images/faq-dog.png";
import ctaPetsImg from "../assets/images/cta-pets.jpg";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const contactChannels = [
  {
    icon: Mail,
    title: "Email Support",
    value: "support@violetvet.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: Phone,
    title: "Helpline",
    value: "+91 98765 43210",
    sub: "Mon – Sat, 9 AM – 8 PM",
  },
  {
    icon: Clock,
    title: "Care Hours",
    value: "8:00 AM – 9:00 PM",
    sub: "Open 7 days a week",
  },
  {
    icon: ShieldAlert,
    title: "Emergency Notice",
    value: "Nearest Vet Hospital",
    sub: "Seek urgent in-person care",
  },
];

const quickLinks = [
  {
    icon: Stethoscope,
    title: "Find Veterinarians",
    desc: "Browse verified doctors",
    path: "/doctors",
  },
  {
    icon: CalendarDays,
    title: "Appointments",
    desc: "Schedule or manage visits",
    path: "/app/appointments",
  },
  {
    icon: Bot,
    title: "AI Pet Assistant",
    desc: "Get instant care guidance",
    path: "/app/ai",
  },
];

const faqs = [
  {
    question: "How quickly does support respond?",
    answer:
      "Our pet care support team typically responds to all messages within 24 hours.",
  },
  {
    question: "How can I reschedule an appointment?",
    answer:
      "Go to your Appointments dashboard, pick your scheduled visit, and choose a new available time slot.",
  },
  {
    question: "What should I do in a pet emergency?",
    answer:
      "Please contact or visit your nearest veterinary hospital immediately. Do not wait for online chat or email responses during emergencies.",
  },
  {
    question: "Can veterinarians join VioletVet?",
    answer:
      "Yes! Qualified veterinarians can reach out through this form or register directly on our platform to connect with pet owners.",
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

export function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "Appointment Support",
    petName: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const containerRef = useRef(null);
  const heroContentRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      topic: "Appointment Support",
      petName: "",
      message: "",
    });
    setSubmitted(false);
  };

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

      gsap.from(".gsap-channel-card", {
        opacity: 0,
        y: 22,
        scale: 0.95,
        duration: 0.55,
        stagger: 0.08,
        ease: "back.out(1.2)",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-channels-grid",
          start: "top 90%",
          once: true,
        },
      });

      gsap.from(".gsap-contact-left", {
        opacity: 0,
        x: -32,
        duration: 0.75,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-contact-main",
          start: "top 88%",
          once: true,
        },
      });

      gsap.from(".gsap-contact-form", {
        opacity: 0,
        x: 32,
        duration: 0.75,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-contact-main",
          start: "top 88%",
          once: true,
        },
      });

      gsap.from(".gsap-faq-intro", {
        opacity: 0,
        x: -24,
        duration: 0.65,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-faq-section",
          start: "top 90%",
          once: true,
        },
      });

      gsap.from(".gsap-faq-dog", {
        opacity: 0,
        y: 22,
        scale: 0.94,
        duration: 0.75,
        ease: "back.out(1.2)",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-faq-section",
          start: "top 90%",
          once: true,
        },
      });

      gsap.from(".gsap-faq-card", {
        opacity: 0,
        x: 24,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: ".gsap-faq-list",
          start: "top 92%",
          once: true,
        },
      });

      gsap.utils.toArray(".contact-reveal").forEach((el) => {
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

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-[#FFFBF5] text-[#2D3138]"
    >
      {/* HERO BANNER */}
      <section className="relative flex min-h-[calc(100svh-65px)] w-full items-center overflow-hidden bg-[#1D150E]">
        <img
          src={ctaPetsImg}
          alt=""
          loading="eager"
          className="gsap-hero-bg absolute inset-0 h-full w-full object-cover object-[25%_25%] -scale-x-100"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#17110B]/95 via-[#17110B]/75 to-[#17110B]/30" />
        <HeartDoodle className="gsap-float-heart pointer-events-none absolute right-[10%] top-[28%] z-20 hidden h-9 w-9 rotate-12 opacity-80 lg:block" />

        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
          <div ref={heroContentRef} className="max-w-lg">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFEAD1] px-3 py-1 text-xs font-semibold text-[#C25900]">
              <PawPrint
                size={12}
                className="fill-[#FF8C1A] text-[#FF8C1A]"
              />
              Contact VioletVet
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
              We Are Here To
              <span className="mt-1 block text-[#FF9825]">
                Help &amp; Support You.
              </span>
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">
              Find veterinary support, ask questions about your pet&apos;s
              care, or reach out to our team anytime.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/doctors"
                className="group inline-flex items-center gap-2 rounded-full bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#FFA242]"
              >
                <Stethoscope size={16} />
                Find a Veterinarian
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
              <span className="font-semibold text-[#FF9825]">Contact</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CHANNELS STRIP */}
      <section className="border-b border-[#F4EAE0] bg-white py-7 lg:py-8">
        <div className="gsap-channels-grid mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 lg:grid-cols-4 lg:gap-5">
          {contactChannels.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="gsap-channel-card flex flex-col items-center rounded-2xl border border-[#F3E5D3] bg-[#FFFBF5] px-4 py-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#FFD39E]"
              >
                <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
                  <Icon size={20} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9A5B1A]">
                  {item.title}
                </span>
                <h2 className="mt-0.5 text-sm font-bold text-[#22262E]">
                  {item.value}
                </h2>
                <p className="mt-0.5 text-xs text-[#5C6470]">{item.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT FORM + QUICK HELP */}
      <section className="gsap-contact-main mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          {/* Left Visual & Quick Links */}
          <div className="gsap-contact-left flex flex-col justify-between gap-4 rounded-2xl border border-[#F5E2CA] bg-gradient-to-br from-[#FFF6EA] to-[#FFEDD6] p-5 shadow-sm lg:col-span-5">
            <div>
              <div className="overflow-hidden rounded-xl border-2 border-white shadow-sm">
                <img
                  src={whoWeAreVetImg}
                  alt="Veterinarian hugging a happy golden retriever"
                  loading="lazy"
                  className="h-44 w-full object-cover object-center sm:h-48"
                />
              </div>

              <div className="mt-4">
                <SectionBadge>Quick Actions</SectionBadge>
                <h2 className="mt-2 text-xl font-extrabold text-[#22262E]">
                  Need Immediate Pet Help?
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#5C6470]">
                  Explore direct services or start a quick chat with our AI
                  assistant.
                </p>
              </div>

              <div className="mt-4 space-y-2.5">
                {quickLinks.map((q) => {
                  const Icon = q.icon;
                  return (
                    <Link
                      key={q.path}
                      to={q.path}
                      className="group flex items-center justify-between rounded-xl border border-[#F3E5D3] bg-white px-3.5 py-2.5 transition hover:border-[#FF9825] hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFEAD1] text-[#E66B00]">
                          <Icon size={16} />
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#22262E] sm:text-sm">
                            {q.title}
                          </div>
                          <div className="text-[11px] text-[#5C6470]">
                            {q.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        size={15}
                        className="text-[#9CA3AF] transition-transform group-hover:translate-x-1 group-hover:text-[#E66B00]"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#F7D7B0] bg-white/80 px-3.5 py-2.5 text-xs leading-5 text-[#6B4A23]">
              <strong>Emergency Note:</strong> For urgent medical emergencies,
              contact your nearest veterinary hospital immediately.
            </div>
          </div>

          {/* Right Form Card */}
          <div className="gsap-contact-form flex flex-col justify-center rounded-2xl border border-[#F3E5D3] bg-white p-6 shadow-sm lg:col-span-7">
            <SectionBadge>Send Us A Message</SectionBadge>
            <h2 className="mt-2.5 text-2xl font-extrabold text-[#22262E]">
              Have A Question?{" "}
              <span className="text-[#F27A15]">Write To Us.</span>
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#5C6470] sm:text-sm">
              Share your query below and our care team will get back to you
              shortly.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-[#F5E2CA] bg-[#FFF8EE] p-6 text-center">
                <CheckCircle2
                  size={40}
                  className="mx-auto text-[#E67300]"
                />
                <h3 className="mt-3 text-lg font-bold text-[#22262E]">
                  Message Received!
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#5C6470] sm:text-sm">
                  Thank you, <span className="font-semibold">{form.name}</span>.
                  We have received your message regarding{" "}
                  <span className="font-semibold">{form.topic}</span> and will
                  reply to <span className="font-semibold">{form.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FF8C1A] px-5 py-2 text-xs font-semibold text-[#2E1E0F] transition hover:bg-[#FFA242]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-[#2D3138]">
                    Full Name
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="mt-1.5 w-full rounded-xl border border-[#EBD8C3] bg-[#FFFBF5] px-3.5 py-2.5 text-sm font-normal text-[#2D3138] outline-none transition focus:border-[#FF8C1A] focus:bg-white"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#2D3138]">
                    Email Address
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="mt-1.5 w-full rounded-xl border border-[#EBD8C3] bg-[#FFFBF5] px-3.5 py-2.5 text-sm font-normal text-[#2D3138] outline-none transition focus:border-[#FF8C1A] focus:bg-white"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-[#2D3138]">
                    Topic
                    <select
                      value={form.topic}
                      onChange={(e) =>
                        setForm({ ...form, topic: e.target.value })
                      }
                      className="mt-1.5 w-full rounded-xl border border-[#EBD8C3] bg-[#FFFBF5] px-3.5 py-2.5 text-sm font-normal text-[#2D3138] outline-none transition focus:border-[#FF8C1A] focus:bg-white"
                    >
                      <option>Appointment Support</option>
                      <option>Veterinary Inquiry</option>
                      <option>Account &amp; Pet Profiles</option>
                      <option>Feedback &amp; Partnership</option>
                    </select>
                  </label>

                  <label className="block text-xs font-semibold text-[#2D3138]">
                    Pet&apos;s Name (Optional)
                    <input
                      type="text"
                      placeholder="e.g., Bruno"
                      value={form.petName}
                      onChange={(e) =>
                        setForm({ ...form, petName: e.target.value })
                      }
                      className="mt-1.5 w-full rounded-xl border border-[#EBD8C3] bg-[#FFFBF5] px-3.5 py-2.5 text-sm font-normal text-[#2D3138] outline-none transition focus:border-[#FF8C1A] focus:bg-white"
                    />
                  </label>
                </div>

                <label className="block text-xs font-semibold text-[#2D3138]">
                  Message
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us how we can help you and your pet..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#EBD8C3] bg-[#FFFBF5] px-3.5 py-2.5 text-sm font-normal text-[#2D3138] outline-none transition focus:border-[#FF8C1A] focus:bg-white"
                  />
                </label>

                <button
                  type="submit"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8C1A] px-6 py-3 text-sm font-semibold text-[#2E1E0F] shadow-md transition hover:-translate-y-0.5 hover:bg-[#FFA242]"
                >
                  <Send size={15} />
                  Send Message
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQS */}
      <section className="gsap-faq-section mx-auto max-w-6xl px-6 pb-8 pt-4 lg:pb-10">
        <div className="grid items-center gap-6 lg:grid-cols-12">
          <div className="gsap-faq-intro lg:col-span-3">
            <SectionBadge>FAQs</SectionBadge>
            <h2 className="mt-2.5 text-2xl font-extrabold leading-snug tracking-tight text-[#22262E]">
              Common Support Questions
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#5C6470] sm:text-sm">
              Quick answers before you reach out.
            </p>
          </div>

          <div className="gsap-faq-dog flex justify-center lg:col-span-4">
            <img
              src={faqDogImg}
              alt="Smiling golden retriever lying down"
              loading="lazy"
              className="h-[160px] w-full max-w-[260px] object-contain sm:h-[180px]"
            />
          </div>

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

      {/* BOTTOM CTA BANNER */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="contact-reveal relative flex min-h-[210px] items-center overflow-hidden rounded-[22px] bg-[#2D1A08] shadow-xl">
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
              Book a veterinary visit or explore pet healthcare with VioletVet.
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

export default Contact;
