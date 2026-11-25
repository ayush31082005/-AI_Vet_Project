import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  PawPrint,
  CalendarDays,
  Clock,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  FileText,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { useData } from '../services/api';

gsap.registerPlugin(useGSAP);

const statMeta = [
  { key: 'totalPets', label: 'Total Pets', icon: PawPrint },
  { key: 'totalAppointments', label: 'Total Appointments', icon: CalendarDays },
  { key: 'upcomingAppointments', label: 'Upcoming Visits', icon: Clock },
  { key: 'completedAppointments', label: 'Completed Visits', icon: CheckCircle2 },
];

const quickActions = [
  {
    title: 'Manage Pets',
    desc: 'View or add profiles for your furry companions.',
    to: '/app/pets',
    icon: PawPrint,
  },
  {
    title: 'Appointments',
    desc: 'Book, reschedule, and track vet visits.',
    to: '/app/appointments',
    icon: CalendarDays,
  },
  {
    title: 'Find Veterinarians',
    desc: 'Browse qualified doctors & specialists.',
    to: '/app/doctors',
    icon: Stethoscope,
  },
  {
    title: 'Ask AI Assistant',
    desc: 'Get instant pet nutrition & wellness guidance.',
    to: '/app/ai',
    icon: Sparkles,
  },
];

export function Dashboard({ user }) {
  const { data, error, loading } = useData('/dashboard/owner');
  const dashboard = data?.dashboard;
  const d = { totalPets: dashboard?.totals.pets, totalAppointments: dashboard?.totals.appointments, upcomingAppointments: dashboard ? dashboard.appointmentStats.pending + dashboard.appointmentStats.confirmed : undefined, completedAppointments: dashboard?.appointmentStats.completed };
  const scope = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from('.dash-stagger', {
        opacity: 0,
        y: 18,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'all',
      });
    },
    { scope }
  );

  return (
    <div ref={scope} className="space-y-6">
      {/* Welcome Banner */}
      <section className="dash-stagger relative overflow-hidden rounded-2xl border border-[#F5E2CA] bg-gradient-to-r from-[#FFF6EA] via-[#FFEDD6] to-[#FFE2BE] p-6 shadow-xs">
        <PawPrint
          size={90}
          aria-hidden="true"
          className="pointer-events-none absolute -right-3 -bottom-3 -rotate-12 fill-[#FF9825]/15 text-[#FF9825]/15"
        />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C25900] shadow-xs">
              <Heart size={12} className="fill-[#FF8C1A] text-[#FF8C1A]" />
              Pet Care Overview
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#22262E] sm:text-3xl">
              Hello, {user?.fullName || 'Pet Parent'} 👋
            </h1>
            <p className="mt-1 text-sm text-[#5C6470]">
              Here is a quick summary of your pets, appointments, and health
              records.
            </p>
          </div>

          <Link
            to="/app/appointments"
            className="group inline-flex items-center gap-2 rounded-full bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FFA242]"
          >
            <CalendarDays size={16} />
            Book Appointment
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {error && (
        <div className="dash-stagger flex items-center justify-between gap-3 rounded-xl border border-[#FAD0C8] bg-[#FFF1EE] px-4 py-3 text-sm text-[#B91C1C]">
          <span>{error}</span>
          <span className="text-xs font-medium text-[#9A3412]">
            Showing workspace preview
          </span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statMeta.map(({ key, label, icon: Icon }) => (
          <article
            key={key}
            className="dash-stagger group rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#FFD39E] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00] transition-transform group-hover:scale-110">
                <Icon size={20} />
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold tracking-wide text-[#6B7280]">
              {label}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#22262E]">
              {loading ? '…' : d[key] ?? 0}
            </h2>
          </article>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="dash-stagger rounded-2xl border border-[#F3E5D3] bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#22262E]">
              Quick Actions
            </h2>
            <p className="text-xs text-[#5C6470]">
              Jump directly into your daily pet care tasks.
            </p>
          </div>
          <Link
            to="/app/medical"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C25900] hover:underline"
          >
            <FileText size={14} />
            Medical History
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="group flex flex-col justify-between rounded-2xl border border-[#F3E5D3] bg-[#FFFBF5] p-4 transition hover:-translate-y-0.5 hover:border-[#FF9825] hover:bg-white hover:shadow-sm"
              >
                <div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00] transition-transform group-hover:scale-110">
                    <Icon size={19} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-[#22262E]">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#5C6470]">
                    {action.desc}
                  </p>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#D96B08]">
                  Open
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
