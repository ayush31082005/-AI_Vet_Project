import React from 'react';
import { Link } from 'react-router-dom';
import {
  PawPrint,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
} from 'lucide-react';

const exploreLinks = [
  ['Home', '/'],
  ['About', '/about'],
  ['Services', '/services'],
  ['Veterinarians', '/doctors'],
];

const petCareLinks = [
  ['My Pets', '/app/pets'],
  ['Appointments', '/appointments'],
  ['AI Assistant', '/app/ai'],
  ['Contact Us', '/contact'],
];

const socials = [
  { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { name: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { name: 'Twitter', href: 'https://x.com', icon: Twitter },
  { name: 'YouTube', href: 'https://youtube.com', icon: Youtube },
];

export function Footer() {
  return (
    <footer className="block border-t border-[#F3E5D3]/20 bg-[#252A34] p-0 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand + Social Media */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF8C1A] text-white shadow-sm">
              <PawPrint size={20} className="fill-white/20" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-xl font-extrabold tracking-tight text-white">
                Violet<span className="text-[#FF9825]">Vet</span>
              </span>
              <span className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-400">
                AI Pet Healthcare
              </span>
            </span>
          </Link>

          <p className="mt-3 text-xs leading-6 text-slate-300 sm:text-sm">
            Thoughtful healthcare for pets and their people — combining trusted
            veterinarians with intelligent care.
          </p>

          <div className="mt-4 flex items-center gap-2.5">
            {socials.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={name}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:-translate-y-0.5 hover:border-[#FF8C1A] hover:bg-[#FF8C1A] hover:text-[#2E1E0F]"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#FF9825]">
            Explore
          </h3>
          <div className="flex flex-col gap-2.5 text-sm text-slate-300">
            {exploreLinks.map(([name, path]) => (
              <Link
                key={path}
                to={path}
                className="w-fit transition hover:text-[#FF9825]"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>

        {/* Pet Care */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#FF9825]">
            Pet Care
          </h3>
          <div className="flex flex-col gap-2.5 text-sm text-slate-300">
            {petCareLinks.map(([name, path]) => (
              <Link
                key={path}
                to={path}
                className="w-fit transition hover:text-[#FF9825]"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#FF9825]">
            Contact
          </h3>
          <div className="space-y-3 text-sm text-slate-300">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2.5 transition hover:text-[#FF9825]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#FF9825]">
                <Phone size={15} />
              </span>
              <span>+91 98765 43210</span>
            </a>

            <a
              href="mailto:support@violetvet.com"
              className="flex items-center gap-2.5 transition hover:text-[#FF9825]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#FF9825]">
                <Mail size={15} />
              </span>
              <span>support@violetvet.com</span>
            </a>

            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#FF9825]">
                <MapPin size={15} />
              </span>
              <span>New Delhi, India · 8 AM – 9 PM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} VioletVet. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-[#FF9825]">
              Login
            </Link>
            <Link to="/signup" className="hover:text-[#FF9825]">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
