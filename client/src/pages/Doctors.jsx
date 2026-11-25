import React from 'react';
import { PawPrint } from 'lucide-react';
import { Records } from '../components/Records';

export function Doctors() {
  return (
    <div className="w-full bg-[#FFFBF5] text-[#2D3138]">
      <section className="mx-auto max-w-6xl px-6 py-8 lg:py-10">
        <div className="hero-text mb-6 rounded-2xl border border-[#F5E2CA] bg-gradient-to-r from-[#FFF6EA] to-[#FFEDD6] px-6 py-6 shadow-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C25900] shadow-xs">
            <PawPrint size={12} className="fill-[#FF8C1A] text-[#FF8C1A]" />
            Expert Care Team
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#22262E] sm:text-4xl">
            Find Your <span className="text-[#F27A15]">Veterinarian</span>
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-[#5C6470]">
            Explore qualified veterinary professionals and connect with the right
            specialist for your beloved pet.
          </p>
        </div>

        <Records kind="doctors" />
      </section>
    </div>
  );
}
