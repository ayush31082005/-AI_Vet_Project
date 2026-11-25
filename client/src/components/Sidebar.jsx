import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PawPrint,
  Stethoscope,
  CalendarDays,
  FileText,
  Heart,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { Brand } from './Header';

const iconByPath = {
  '/app/dashboard': LayoutDashboard,
  '/doctor/dashboard': LayoutDashboard,
  '/admin/dashboard': LayoutDashboard,
  '/app/pets': PawPrint,
  '/app/doctors': Stethoscope,
  '/admin/doctors': Stethoscope,
  '/app/appointments': CalendarDays,
  '/doctor/appointments': CalendarDays,
  '/app/prescriptions': FileText,
  '/doctor/prescriptions/create': FileText,
  '/app/medical': Heart,
  '/app/ai': Sparkles,
  '/app/profile': User,
  '/doctor/profile': User,
  '/admin/profile': User,
};

export function Sidebar({ links, open, close, logout }) {
  return (
    <aside
      className={`${
        open ? 'open' : ''
      } justify-between border-r border-[#F3E5D3] bg-white px-4 py-5`}
    >
      <div>
        <div className="mb-6 flex items-center justify-between px-1">
          <Brand />
          <button
            type="button"
            onClick={close}
            aria-label="Close sidebar"
            className="close rounded-xl bg-[#FFEAD1] p-2 text-[#C25900] hover:bg-[#FFD8AA]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-[#9A7A58]">
          Workspace
        </div>

        <nav className="flex flex-col gap-1.5">
          {links.map(([label, path]) => {
            const Icon = iconByPath[path] || PawPrint;
            return (
              <NavLink
                key={path}
                to={path}
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#FFEAD1] font-bold text-[#C25900] shadow-xs'
                      : 'text-[#343E4E] hover:bg-[#FFF7EC] hover:text-[#C25900]'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 space-y-2 border-t border-[#F5EBDD] pt-4">
        <Link
          to="/"
          onClick={close}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#5C6470] transition hover:bg-[#FFF7EC] hover:text-[#C25900]"
        >
          <Home size={18} />
          <span>Back to Website</span>
        </Link>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#F3E5D3] bg-[#FFF8EE] px-4 py-2.5 text-sm font-semibold text-[#C25900] transition hover:bg-[#FF8C1A] hover:text-[#2E1E0F]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export function Topbar({ user, toggle }) {
  const initial = (user?.fullName || 'U').trim().charAt(0).toUpperCase();
  const roleLabel =
    user?.role === 'admin'
      ? 'Administrator'
      : ['vet', 'doctor'].includes(user?.role)
      ? 'Veterinarian'
      : 'Pet Parent';

  return (
    <div className="top mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F3E5D3] bg-white px-5 py-3.5 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label="Open navigation"
          className="mobile rounded-xl bg-[#FFEAD1] p-2 text-[#C25900] hover:bg-[#FFD8AA]"
        >
          <Menu size={18} />
        </button>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFEAD1] px-2.5 py-0.5 text-[11px] font-semibold text-[#C25900]">
            <PawPrint size={11} className="fill-[#FF8C1A] text-[#FF8C1A]" />
            VioletVet Portal
          </span>
          <p className="mt-0.5 text-xs font-medium text-[#5C6470]">
            Healthcare Workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-bold text-[#22262E]">
            {user?.fullName || 'Pet Parent'}
          </div>
          <div className="text-[11px] font-medium text-[#9A5B1A]">
            {roleLabel}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9825] to-[#E66B00] text-sm font-bold text-white shadow-sm">
          {initial}
        </div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon = PawPrint }) {
  return (
    <article className="group rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#FFD39E] hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00] transition-transform group-hover:scale-110">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold capitalize tracking-wide text-[#6B7280]">
        {label}
      </p>
      <h2 className="mt-1 text-2xl font-extrabold text-[#22262E]">
        {value ?? 0}
      </h2>
    </article>
  );
}
