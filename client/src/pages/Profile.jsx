import React from 'react';
import { User, Mail, Phone, ShieldCheck, PawPrint } from 'lucide-react';

export function Profile({ user }) {
  const initial = (user?.fullName || 'U').trim().charAt(0).toUpperCase();
  const details = [
    { icon: User, label: 'Full Name', value: user?.fullName || 'Not provided' },
    { icon: Mail, label: 'Email Address', value: user?.email || 'Not provided' },
    { icon: Phone, label: 'Mobile Number', value: user?.mobile || 'Not provided' },
    { icon: ShieldCheck, label: 'Account Role', value: user?.role || 'petOwner' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#F5E2CA] bg-gradient-to-r from-[#FFF6EA] to-[#FFEDD6] p-6 shadow-xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF9825] to-[#E66B00] text-2xl font-extrabold text-white shadow-sm">
          {initial}
        </div>
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#C25900]">
            <PawPrint size={11} className="fill-[#FF8C1A] text-[#FF8C1A]" />
            My Profile
          </span>
          <h1 className="mt-1.5 text-2xl font-extrabold text-[#22262E]">
            {user?.fullName || 'Pet Parent'}
          </h1>
          <p className="text-xs text-[#5C6470]">{user?.email}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {details.map((d) => {
          const Icon = d.icon;
          return (
            <div
              key={d.label}
              className="flex items-center gap-3.5 rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold text-[#6B7280]">{d.label}</p>
                <p className="mt-0.5 text-sm font-bold text-[#22262E]">
                  {d.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
