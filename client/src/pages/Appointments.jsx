import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginForBooking } from '../services/bookingNavigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  PawPrint,
  ArrowRight,
  ChevronRight,
  CalendarDays,
  Clock,
  Stethoscope,
  Video,
  Building2,
  CheckCircle2,
  UserCheck,
  FileText,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { useData, rows, api } from '../services/api';

import heroPetsImg from '../assets/images/hero-pets.jpg';
import whyChooseVetImg from '../assets/images/why-choose-vet.png';
import faqDogImg from '../assets/images/faq-dog.png';
import ctaPetsImg from '../assets/images/cta-pets.jpg';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const fallbackDoctors = [
  'Dr. Sarah Johnson — General Veterinary Care',
  'Dr. Ben Carter — Small Animal Surgery',
  'Dr. Ananya Verma — Pet Nutrition & Wellness',
  'Dr. Vikram Rao — Dental & Preventive Care',
];

const timeSlots = [
  '09:30 AM',
  '11:00 AM',
  '12:30 PM',
  '02:30 PM',
  '04:30 PM',
  '06:30 PM',
];

const bookingSteps = [
  {
    icon: Stethoscope,
    title: 'Choose Veterinarian',
    description: 'Pick a specialist suited to your pet’s care needs.',
  },
  {
    icon: CalendarDays,
    title: 'Select Date & Slot',
    description: 'Choose a convenient date and preferred visit time.',
  },
  {
    icon: PawPrint,
    title: 'Share Pet Details',
    description: 'Add your pet’s name, species, and visit reason.',
  },
  {
    icon: UserCheck,
    title: 'Get Care & Follow-up',
    description: 'Visit the clinic or join online and track records.',
  },
];

const faqs = [
  {
    question: 'Can I reschedule my appointment later?',
    answer:
      'Yes. Signed-in pet parents can reschedule or manage upcoming visits anytime from the Appointments dashboard.',
  },
  {
    question: 'Do you offer online video consultations?',
    answer:
      'Yes, you can choose between In-Clinic Visit and Video Consultation right in the booking form above.',
  },
  {
    question: 'What should I bring to an in-clinic visit?',
    answer:
      'Bring your pet on a leash or in a carrier along with any past vaccination records or active prescriptions.',
  },
  {
    question: 'What if my pet has an emergency?',
    answer:
      'For urgent or life-threatening symptoms, please visit or call your nearest 24/7 veterinary hospital immediately.',
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

function HeartDoodle({ className = '' }) {
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

const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const slotDate = (date, slot) => {
  const match = slot?.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!date || !match) return new Date(NaN);
  const hour = Number(match[1]) % 12 + (match[3] === 'PM' ? 12 : 0);
  return new Date(`${date}T${String(hour).padStart(2, '0')}:${match[2]}:00`);
};

export function Appointments() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    const timer = setInterval(update, 15000);
    window.addEventListener('focus', update);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); };
  }, []);
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedDoctorId = searchParams.get('doctorId');
  const location = useLocation();
  useEffect(() => {
    if (ready && !user && (selectedDoctorId || location.hash === '#appointment-form')) {
      navigate(loginForBooking(location.pathname + location.search + '#appointment-form'), { replace: true });
    }
  }, [ready, user, selectedDoctorId, location.pathname, location.search, location.hash, navigate]);
  useEffect(() => {
    if (location.hash !== '#appointment-form') return;
    const frame = requestAnimationFrame(() => {
      document.getElementById('appointment-form')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.key, location.hash]);
  const { data } = useData('/doctors');
  const apiDoctors = rows(data, 'doctors').map(
    (d) =>
      `${d.fullName ?? d.name ?? d.user?.fullName ?? 'Veterinarian'}${
        d.specialization ? ` — ${d.specialization}` : ''
      }`
  );
  const doctorOptions = apiDoctors;
  const [bookingError, setBookingError] = useState('');
  const [bookingBusy, setBookingBusy] = useState(false);

  const todayStr = localDate(now);

  const [visitType, setVisitType] = useState('In-Clinic Visit');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({
    ownerName: '',
    contact: '',
    petName: '',
    species: 'Dog',
    doctor: doctorOptions[0],
    date: todayStr,
    reason: '',
  });
  const [booked, setBooked] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const availableSlots = timeSlots.filter(slot => slotDate(form.date, slot) > now);
  useEffect(() => {
    if (form.date < todayStr) {
      setForm(current => ({ ...current, date: todayStr }));
      return;
    }
    if (!availableSlots.includes(selectedSlot)) setSelectedSlot(availableSlots[0] || '');
  }, [now, form.date, todayStr, selectedSlot]);
  useEffect(() => {
    if (!selectedDoctorId || !data) return;
    const index = rows(data, 'doctors').findIndex(doctor => doctor._id === selectedDoctorId);
    if (index >= 0) setForm(current => ({ ...current, doctor: apiDoctors[index] }));
  }, [selectedDoctorId, data]);

  const containerRef = useRef(null);
  const heroContentRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    if (!user) {
      navigate(loginForBooking(location.pathname + location.search + '#appointment-form'));
      return;
    }
    if (bookingBusy) return;
    if (!form.ownerName.trim() || !form.petName.trim() || !form.date) return;
    setBookingError('');
    setBookingBusy(true);
    try {
      if (!selectedSlot || slotDate(form.date, selectedSlot) <= new Date()) throw new Error('Please select an upcoming time slot.');
      if (!localStorage.getItem('vetToken')) throw new Error('Please login before booking an appointment.');
      if (visitType !== 'In-Clinic Visit') throw new Error('Online consultations are not supported yet. Select In-Clinic Visit.');
      const pets = rows(await api('/pets'), 'pets');
      const pet = pets.find(p => p.petName.toLowerCase() === form.petName.trim().toLowerCase());
      const doctorIndex = doctorOptions.indexOf(form.doctor || doctorOptions[0]);
      const doctor = rows(data, 'doctors')[doctorIndex];
      if (!doctor) throw new Error('Select an available verified doctor.');
      const [, hours, minutes, period] = selectedSlot.match(/(\d+):(\d+)\s*(AM|PM)/) || [];
      const hour = Number(hours) % 12 + (period === 'PM' ? 12 : 0);
      const scheduledAt = new Date(`${form.date}T${String(hour).padStart(2, '0')}:${minutes}:00`).toISOString();
      const result = await api('/appointments', 'POST', { petId: pet?._id, petName: form.petName.trim(), species: form.species, doctorId: doctor._id, scheduledAt, reason: form.reason.trim() || 'General consultation' });
      setBooked({
      ...form,
      visitType,
      slot: selectedSlot,
      refId: result.appointment._id,
      isDemo: result.appointment.isDemo,
    });
    } catch (error) { setBookingError(error.message); }
    finally { setBookingBusy(false); }
  };

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      if (heroContentRef.current) {
        gsap.from(heroContentRef.current.children, {
          opacity: 0,
          y: 24,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'all',
        });
      }

      gsap.from('.gsap-hero-bg', {
        scale: 1.07,
        duration: 5,
        ease: 'power1.out',
      });

      gsap.to('.gsap-float-heart', {
        y: -7,
        rotation: 18,
        scale: 1.07,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.gsap-blob-a', {
        y: -8,
        x: 5,
        scale: 1.04,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('.gsap-blob-b', {
        y: 7,
        x: -5,
        scale: 0.96,
        duration: 3.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.from('.gsap-appt-left', {
        opacity: 0,
        x: -30,
        duration: 0.75,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.gsap-appt-grid',
          start: 'top 88%',
          once: true,
        },
      });

      gsap.from('.gsap-appt-form', {
        opacity: 0,
        x: 30,
        duration: 0.75,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.gsap-appt-grid',
          start: 'top 88%',
          once: true,
        },
      });

      gsap.from('.gsap-process-item', {
        opacity: 0,
        y: 22,
        scale: 0.95,
        duration: 0.5,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.gsap-process-row',
          start: 'top 90%',
          once: true,
        },
      });

      gsap.from('.gsap-faq-intro', {
        opacity: 0,
        x: -24,
        duration: 0.65,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.gsap-faq-section',
          start: 'top 90%',
          once: true,
        },
      });

      gsap.from('.gsap-faq-dog', {
        opacity: 0,
        y: 22,
        scale: 0.94,
        duration: 0.75,
        ease: 'back.out(1.2)',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.gsap-faq-section',
          start: 'top 90%',
          once: true,
        },
      });

      gsap.from('.gsap-faq-card', {
        opacity: 0,
        x: 24,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.gsap-faq-list',
          start: 'top 92%',
          once: true,
        },
      });

      gsap.utils.toArray('.appt-reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.65,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        });
      });
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      if (
        openFaq === null ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        ScrollTrigger.refresh();
        return;
      }

      gsap.from('.gsap-faq-answer', {
        opacity: 0,
        y: -8,
        duration: 0.28,
        ease: 'power2.out',
        clearProps: 'all',
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
          src={heroPetsImg}
          alt=""
          loading="eager"
          className="gsap-hero-bg absolute inset-0 h-full w-full object-cover object-[70%_25%]"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#17110B]/95 via-[#17110B]/68 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-transparent to-black/15" />

        <HeartDoodle className="gsap-float-heart pointer-events-none absolute right-[10%] top-[30%] z-20 hidden h-9 w-9 rotate-12 opacity-80 lg:block" />

        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
          <div ref={heroContentRef} className="max-w-lg">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#FFEAD1] px-3 py-1 text-xs font-semibold text-[#C25900]">
              <PawPrint
                size={12}
                className="fill-[#FF8C1A] text-[#FF8C1A]"
              />
              Easy Vet Scheduling
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
              Book Your Pet&apos;s
              <span className="mt-1 block text-[#FF9825]">
                Vet Appointment.
              </span>
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">
              Choose a trusted veterinarian, pick a convenient date and time
              slot, and keep your beloved pet&apos;s checkups on schedule.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="#book-appointment"
                className="group inline-flex items-center gap-2 rounded-full bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#FFA242]"
              >
                <CalendarDays size={16} />
                Schedule Now
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>

              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-black/35 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[#2D3138]"
              >
                <Stethoscope size={16} />
                Browse Veterinarians
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-white/75">
              <Link to="/" className="hover:text-[#FF9825]">
                Home
              </Link>
              <ChevronRight size={13} />
              <span className="font-semibold text-[#FF9825]">Appointments</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE APPOINTMENT BOOKING SECTION */}
      <section
        id="book-appointment"
        className="gsap-appt-grid mx-auto max-w-6xl px-6 py-8 lg:py-10"
      >
        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          {/* Left Visual & Clinic Care Highlights */}
          <div className="gsap-appt-left flex flex-col justify-between rounded-2xl border border-[#F5E2CA] bg-gradient-to-br from-[#FFF6EA] to-[#FFEDD6] p-6 shadow-sm lg:col-span-5">
            <div>
              <SectionBadge>Clinic &amp; Online Visits</SectionBadge>
              <h2 className="mt-2.5 text-2xl font-extrabold leading-tight text-[#22262E]">
                Compassionate Care{' '}
                <span className="text-[#F27A15]">On Your Schedule.</span>
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#5C6470] sm:text-sm">
                Whether it&apos;s a routine wellness checkup, vaccination, or
                consultation, booking takes less than a minute.
              </p>

              <div className="relative mx-auto my-4 flex max-w-[270px] items-center justify-center">
                <div
                  aria-hidden="true"
                  className="gsap-blob-a absolute -left-2 top-4 h-28 w-28 rounded-[62%_38%_46%_54%/60%_44%_56%_40%] bg-[#FFE2B8]/80"
                />
                <div
                  aria-hidden="true"
                  className="gsap-blob-b absolute bottom-3 right-0 h-20 w-20 rounded-[42%_58%_50%_50%/48%_52%_48%_52%] bg-[#FF9825]/75"
                />
                <img
                  src={whyChooseVetImg}
                  alt="Veterinarian caring for a dog"
                  loading="lazy"
                  className="relative z-10 h-[195px] w-full object-contain [mask-image:linear-gradient(to_bottom,black_84%,transparent_100%)]"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 rounded-xl border border-[#F3E5D3] bg-white px-4 py-2.5 text-xs font-semibold text-[#2D3138]">
                <Clock size={16} className="shrink-0 text-[#E66B00]" />
                <span>Clinic Hours: Mon – Sun, 8:00 AM – 9:00 PM</span>
              </div>
              <Link
                to="/app/appointments"
                className="group flex items-center justify-between rounded-xl border border-[#F3E5D3] bg-white px-4 py-2.5 text-xs font-semibold text-[#C25900] transition hover:border-[#FF8C1A]"
              >
                <span className="flex items-center gap-2">
                  <FileText size={15} />
                  Already booked? Manage in Dashboard
                </span>
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          {/* Right Booking Form Card */}
          <div className="gsap-appt-form flex flex-col justify-center rounded-2xl border border-[#F3E5D3] bg-white p-6 shadow-sm lg:col-span-7">
            <SectionBadge>Schedule Visit</SectionBadge>
            <h2 className="mt-2.5 text-2xl font-extrabold text-[#22262E]">
              Book An <span className="text-[#F27A15]">Appointment</span>
            </h2>
            <p className="mt-1 text-xs text-[#5C6470] sm:text-sm">
              Select visit mode, veterinarian, date, and your preferred time
              slot.
            </p>

            {booked ? (
              <div className="mt-5 rounded-2xl border border-[#F5E2CA] bg-[#FFF8EE] p-6 text-center">
                <CheckCircle2
                  size={42}
                  className="mx-auto text-[#E67300]"
                />
                <span className="mt-2 inline-block rounded-full bg-[#FFEAD1] px-3 py-0.5 text-[11px] font-bold text-[#C25900]">
                  {booked.isDemo ? 'Demo booking ref (no real consultation)' : 'Booking Ref'}: {booked.refId}
                </span>
                <h3 className="mt-2 text-lg font-extrabold text-[#22262E]">
                  Appointment Request Confirmed!
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-[#5C6470] sm:text-sm">
                  <span className="font-semibold text-[#22262E]">
                    {booked.petName}
                  </span>{' '}
                  ({booked.species}) is scheduled for a{' '}
                  <span className="font-semibold text-[#C25900]">
                    {booked.visitType}
                  </span>{' '}
                  with <span className="font-semibold">{booked.doctor}</span> on{' '}
                  <span className="font-semibold">{booked.date}</span> at{' '}
                  <span className="font-semibold">{booked.slot}</span>.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBooked(null)}
                    className="rounded-xl bg-[#FF8C1A] px-5 py-2.5 text-xs font-semibold text-[#2E1E0F] hover:bg-[#FFA242]"
                  >
                    Book Another Visit
                  </button>
                  <Link
                    to="/app/appointments"
                    className="rounded-xl border border-[#F3E5D3] bg-white px-5 py-2.5 text-xs font-semibold text-[#C25900] hover:bg-[#FFF4E5]"
                  >
                    Open Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <form id="appointment-form" onSubmit={handleSubmit} className="mt-4 scroll-mt-28 space-y-4">
                {rows(data, 'doctors').find(doctor => doctor._id === selectedDoctorId)?.isDemo && <p role="status" className="notice">Fictional demo profile. Bookings are saved for testing only; no real consultation is scheduled.</p>}
                {bookingError && <p role="alert" className="error">{bookingError}</p>}
                {bookingBusy && <p role="status">Booking appointment...</p>}
                {/* Visit Type Pills */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'In-Clinic Visit', icon: Building2 },
                    { label: 'Video Consultation', icon: Video },
                  ].map(({ label, icon: Icon }) => {
                    const active = visitType === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setVisitType(label)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition sm:text-sm ${
                          active
                            ? 'border-[#FF8C1A] bg-[#FFEAD1] text-[#C25900]'
                            : 'border-[#EBD8C3] bg-[#FFFBF5] text-[#5C6470] hover:border-[#FFD39E]'
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#2D3138]">
                    Your Name
                    <input
                      type="text"
                      required
                      placeholder="Pet parent name"
                      value={form.ownerName}
                      onChange={(e) =>
                        setForm({ ...form, ownerName: e.target.value })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-[#2D3138]">
                    Phone or Email
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={form.contact}
                      onChange={(e) =>
                        setForm({ ...form, contact: e.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#2D3138]">
                    Pet Name
                    <input
                      type="text"
                      required
                      placeholder="e.g., Bruno"
                      value={form.petName}
                      onChange={(e) =>
                        setForm({ ...form, petName: e.target.value })
                      }
                    />
                  </label>

                  <label className="text-xs font-semibold text-[#2D3138]">
                    Pet Species
                    <select
                      value={form.species}
                      onChange={(e) =>
                        setForm({ ...form, species: e.target.value })
                      }
                    >
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Bird</option>
                      <option>Rabbit / Small Pet</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-[#2D3138]">
                    Select Veterinarian
                    <select
                      value={form.doctor}
                      onChange={(e) =>
                        setForm({ ...form, doctor: e.target.value })
                      }
                    >
                      {doctorOptions.map((doc) => (
                        <option key={doc} value={doc}>
                          {doc}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs font-semibold text-[#2D3138]">
                    Preferred Date
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />
                  </label>
                </div>

                {/* Time Slot Selector */}
                <div>
                  <span className="mb-2 block text-xs font-semibold text-[#2D3138]">
                    Preferred Time Slot
                  </span>
                  <p className="mb-2 text-xs text-[#5C6470]" aria-live="off">Current local time: {now.toLocaleString()} ({Intl.DateTimeFormat().resolvedOptions().timeZone})</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {timeSlots.map((slot) => {
                      const active = selectedSlot === slot;
                      const expired = slotDate(form.date, slot) <= now;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={expired}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            active
                              ? 'border-[#FF8C1A] bg-[#FF8C1A] text-[#2E1E0F] shadow-xs'
                              : 'border-[#EBD8C3] bg-[#FFFBF5] text-[#5C6470] hover:border-[#FF9825]'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {!availableSlots.length && <p role="status" className="mt-2 text-xs text-[#C25900]">No upcoming slots on this date. Please select a later date.</p>}
                </div>

                <label className="text-xs font-semibold text-[#2D3138]">
                  Reason for Visit (Optional)
                  <input
                    type="text"
                    placeholder="Routine checkup, vaccination, nutrition advice..."
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                  />
                </label>

                <button
                  type="submit"
                  disabled={bookingBusy || !selectedSlot}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8C1A] px-6 py-3 text-sm font-semibold text-[#2E1E0F] shadow-md transition hover:-translate-y-0.5 hover:bg-[#FFA242]"
                >
                  <CalendarDays size={16} />
                  Confirm Appointment
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

      {/* SIMPLE BOOKING PROCESS */}
      <section className="mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="appt-reveal text-center">
          <SectionBadge>Booking Steps</SectionBadge>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#22262E] sm:text-3xl">
            How Booking Works
          </h2>
          <p className="mt-1 text-xs text-[#5C6470] sm:text-sm">
            Four quick steps to reserve your veterinary consultation.
          </p>
        </div>

        <div className="gsap-process-row mt-6 flex flex-col items-stretch justify-between gap-3 lg:flex-row">
          {bookingSteps.map((step, index) => {
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

                {index < bookingSteps.length - 1 && (
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

      {/* FAQS */}
      <section className="gsap-faq-section mx-auto max-w-6xl px-6 pb-8 pt-2 lg:pb-10">
        <div className="grid items-center gap-6 lg:grid-cols-12">
          <div className="gsap-faq-intro lg:col-span-3">
            <SectionBadge>FAQs</SectionBadge>
            <h2 className="mt-2.5 text-2xl font-extrabold leading-snug tracking-tight text-[#22262E]">
              Appointment Questions
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#5C6470] sm:text-sm">
              Helpful details before your pet&apos;s visit.
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
        <div className="appt-reveal relative flex min-h-[210px] items-center overflow-hidden rounded-[22px] bg-[#2D1A08] shadow-xl">
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
                Need Quick Pet Advice
              </span>
              <span className="mt-0.5 block text-[#FF9825]">
                Before Your Visit?
              </span>
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/85 sm:text-sm">
              Try our AI Pet Assistant for nutrition, grooming, and wellness
              guidance anytime.
            </p>

            <Link
              to="/app/ai"
              className="group mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#FFA242]"
            >
              <Sparkles size={16} />
              Try AI Assistant
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

export default Appointments;
