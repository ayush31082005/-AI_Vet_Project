import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Users,
  Stethoscope,
  PawPrint,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  User,
  Globe,
  Plus,
} from 'lucide-react';
import { useData, api, rows } from '../services/api';

gsap.registerPlugin(useGSAP);

const adminStats = [
  { key: 'totalUsers', label: 'Total Users', icon: Users },
  { key: 'totalDoctors', label: 'Total Doctors', icon: Stethoscope },
  { key: 'totalPets', label: 'Total Pets', icon: PawPrint },
  { key: 'totalAppointments', label: 'Total Appointments', icon: CalendarDays },
];

const adminQuickActions = [
  {
    title: 'Manage Doctors',
    desc: 'Add new veterinarians and review registered specialists.',
    to: '/admin/doctors',
    icon: Stethoscope,
  },
  {
    title: 'Public Vet Directory',
    desc: 'Preview how doctors appear to pet parents.',
    to: '/doctors',
    icon: Users,
  },
  {
    title: 'Admin Profile',
    desc: 'View your administrator account details.',
    to: '/admin/profile',
    icon: User,
  },
  {
    title: 'Main Website',
    desc: 'Open the public VioletVet landing page.',
    to: '/',
    icon: Globe,
  },
];

export function AdminDashboard() {
  const { data, error, loading } = useData('/dashboard/admin');
  const totals = data?.dashboard?.totals;
  const stats = { totalUsers: totals?.users, totalDoctors: totals?.doctors, totalPets: totals?.pets, totalAppointments: totals?.appointments };
  const scope = useRef(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.from('.admin-stagger', {
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
      <section className="admin-stagger relative overflow-hidden rounded-2xl border border-[#F5E2CA] bg-gradient-to-r from-[#FFF6EA] via-[#FFEDD6] to-[#FFE2BE] p-6 shadow-xs">
        <PawPrint
          size={90}
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 -right-3 -rotate-12 fill-[#FF9825]/15 text-[#FF9825]/15"
        />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C25900] shadow-xs">
              <ShieldCheck size={13} className="text-[#FF8C1A]" />
              Administrator Portal
            </span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#22262E] sm:text-3xl">
              Admin Control Center
            </h1>
            <p className="mt-1 text-sm text-[#5C6470]">
              Platform-wide overview of registered users, veterinarians, pets,
              and appointments.
            </p>
          </div>

          <Link
            to="/admin/doctors"
            className="group inline-flex items-center gap-2 rounded-full bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FFA242]"
          >
            <UserPlus size={16} />
            Manage Doctors
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {error && (
        <div className="admin-stagger flex items-center justify-between gap-3 rounded-xl border border-[#FAD0C8] bg-[#FFF1EE] px-4 py-3 text-sm text-[#B91C1C]">
          <span>{error}</span>
          <span className="text-xs font-medium text-[#9A3412]">
            Showing admin workspace preview
          </span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map(({ key, label, icon: Icon }) => (
          <article
            key={key}
            className="admin-stagger group rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#FFD39E] hover:shadow-md"
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
              {loading ? '…' : stats[key] ?? 0}
            </h2>
          </article>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="admin-stagger rounded-2xl border border-[#F3E5D3] bg-white p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-[#22262E]">
            Admin Quick Actions
          </h2>
          <p className="text-xs text-[#5C6470]">
            Access doctor onboarding, directory previews, and account settings.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminQuickActions.map((action) => {
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

const doctorFields = [
  { name: 'userId', label: 'Existing vet User ID', placeholder: 'MongoDB user ID with vet role' },
  { name: 'specialization', label: 'Specialization', placeholder: 'Small Animal Surgery' },
  { name: 'qualification', label: 'Qualification', placeholder: 'BVSc & AH, MVSc' },
  { name: 'experience', label: 'Experience (Years)', placeholder: '5' },
  { name: 'consultationFees', label: 'Consultation Fees', placeholder: '500' },
  ...['licenseNumber', 'clinicName', 'addressLine', 'city', 'state', 'postalCode'].map(name => ({ name, label: name, placeholder: name })),
];

export function AdminDoctors() {
  const { data, error, loading, load } = useData('/doctors/admin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const doctorList = rows(data, 'doctors');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const body = { userId: values.userId, specialization: values.specialization, qualifications: values.qualification.split(',').map(v => v.trim()).filter(Boolean), experienceYears: Number(values.experience), consultationFee: Number(values.consultationFees), licenseNumber: values.licenseNumber, clinicName: values.clinicName, clinicAddress: { addressLine: values.addressLine, city: values.city, state: values.state, postalCode: values.postalCode } };
    try {
      await api('/doctors', 'POST', body);
      setMessage('Doctor saved successfully');
      form.reset();
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
            <Stethoscope size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-[#22262E]">
              Manage Doctors
            </h1>
            <p className="text-xs text-[#5C6470]">
              Register new veterinarians and browse active specialists.
            </p>
          </div>
        </div>
      </div>

      {/* Add Doctor Form Card */}
      <form
        className="rounded-2xl border border-[#F3E5D3] bg-white p-6 shadow-xs"
        onSubmit={submit}
      >
        <div className="mb-4 flex items-center gap-2">
          <Plus size={18} className="text-[#E66B00]" />
          <h2 className="text-base font-bold text-[#22262E]">
            Add New Veterinarian
          </h2>
        </div>

        <div className="formgrid">
          {doctorFields.map((f) => (
            <label key={f.name}>
              {f.label}
              <input
                name={f.name}
                type={f.type || 'text'}
                placeholder={f.placeholder}
                required
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] shadow-sm transition hover:bg-[#FFA242]"
          >
            <UserPlus size={16} />
            {busy ? 'Saving…' : 'Add Doctor'}
          </button>
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}

      {/* Doctors Grid */}
      {loading ? (
        <div className="rounded-2xl border border-[#F3E5D3] bg-white p-8 text-center text-sm text-[#5C6470]">
          Loading doctors…
        </div>
      ) : !doctorList.length ? (
        <div className="rounded-2xl border border-[#F3E5D3] bg-white p-8 text-center">
          <Stethoscope size={32} className="mx-auto text-[#FFB347]" />
          <h3 className="mt-3 text-base font-bold text-[#22262E]">
            No doctors found
          </h3>
          <p className="mt-1 text-xs text-[#5C6470]">
            Use the form above to add a veterinarian to the platform.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctorList.map((d, i) => (
            <article
              className="rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#FFD39E] hover:shadow-md"
              key={d._id ?? i}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
                  <Stethoscope size={20} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#22262E]">
                    {d.fullName ?? d.name ?? d.user?.fullName}
                  </h3>
                  <p className="text-xs font-semibold text-[#D96B08]">
                    {d.specialization || 'Veterinary Specialist'}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-1 border-t border-[#F7EDE0] pt-3 text-xs text-[#5C6470]">
                {d.qualification && <p>Qualification: {d.qualification}</p>}
                {d.experience && <p>Experience: {d.experience} yrs</p>}
                <p className="font-semibold text-[#2D3138]">
                  Consultation Fee: {d.consultationFees ?? 'Not set'}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
