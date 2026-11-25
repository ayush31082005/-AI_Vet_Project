import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { PawPrint, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  ['Home', '/'],
  ['About', '/about'],
  ['Services', '/services'],
  ['Veterinarians', '/doctors'],
  ['Appointments', '/appointments'],
  ['Contact', '/contact'],
];

export function Brand({ lightText = false }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 ${
        lightText ? 'text-white' : 'text-[#2D3138]'
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8C1A] text-white shadow-sm">
        <PawPrint size={22} className="fill-white/20" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`text-xl font-extrabold tracking-tight ${
            lightText ? 'text-white' : 'text-[#2D3138]'
          }`}
        >
          Violet<span className="text-[#F97316]">Vet</span>
        </span>
        <span
          className={`mt-0.5 text-[10px] font-medium tracking-wide ${
            lightText ? 'text-white/80' : 'text-[#7A6A58]'
          }`}
        >
          AI Pet Healthcare
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 block border-b border-orange-100/80 bg-white/95 p-0 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-2.5 lg:px-8">
        <Brand />

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-xl bg-orange-100 p-2 text-slate-800 hover:bg-orange-200 lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav
          className={`${
            open ? 'flex' : 'hidden'
          } w-full flex-col gap-5 lg:flex lg:w-auto lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:pl-12`}
        >
          <div className="flex flex-col gap-4 lg:mx-auto lg:flex-row lg:items-center lg:gap-6">
            {links.map(([name, path]) => (
              <NavLink
                end={path === '/'}
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? 'border-b-2 border-[#FF8C1A] pb-1 text-sm font-semibold text-[#D96B08]'
                    : 'pb-1 text-sm font-medium text-[#343E4E] transition-colors hover:text-[#D96B08]'
                }
              >
                {name}
              </NavLink>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              onClick={() => setOpen(false)}
              to={user ? '/app/dashboard' : '/login'}
              className="rounded-full border border-[#F59E0B] bg-white px-5 py-2 text-center text-sm font-semibold text-[#343E4E] transition hover:bg-[#FFF5E8]"
            >
              {user ? 'Dashboard' : 'Login'}
            </Link>
            {!user && (
              <Link
                onClick={() => setOpen(false)}
                to="/signup"
                className="rounded-full bg-[#FF8C1A] px-5 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#EA7608]"
              >
                Get Started
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export { Footer } from './Footer';
