import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import vetCareImage from '../assets/images/why-choose-vet.png';
import { useAuth } from '../context/AuthContext';
import { loginForBooking } from '../services/bookingNavigation';
import {
  PawPrint,
  Heart,
  Calendar,
  LayoutDashboard,
  Stethoscope,
  FileText,
  User,
  Plus,
  Sparkles,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useData, api, endpoints, rows } from '../services/api';

const fields = {
  pets: [
    'petName',
    'species',
    'breed',
    'age',
    'gender',
    'weight',
    'color',
    'vaccinationStatus',
    'medicalHistory',
  ],
  // appointments: ['petId', 'doctorId', 'scheduledAt', 'reason'],
};

const petOptions = {
  species: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Guinea Pig', 'Fish', 'Reptile', 'Horse', 'Other'],
  gender: ['Male', 'Female', 'Unknown'],
  vaccinationStatus: ['Vaccinated', 'Not Vaccinated', 'Partially Vaccinated', 'Unknown'],
};

function formatFieldLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());
}

export function Records({ kind }) {
  const { data, error, loading, load } = useData(endpoints[kind]);
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState('');
  const list = rows(data, kind);
  const meta = nav.find((n) => n[1] === kind);
  const TitleIcon = meta?.[2] || PawPrint;

  async function save(e) {
    e.preventDefault();
    try {
      const f = new FormData(e.target);
      const body = kind === 'pets' ? f : Object.fromEntries(f);
      if (kind === 'appointments') body.scheduledAt = new Date(body.scheduledAt).toISOString();
      if (kind === 'pets' && !f.get('petImage')?.size) f.delete('petImage');
      await api(
        (kind === 'appointments' ? '/appointments' : endpoints[kind]) + (edit._id ? '/' + edit._id : ''),
        edit._id ? 'PUT' : 'POST',
        body
      );
      setEdit(null);
      setMsg('Saved successfully');
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Confirm deletion?')) return;
    try {
      await api(endpoints[kind] + '/' + id, 'DELETE');
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
            <TitleIcon size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-[#22262E]">
              {meta?.[0] || 'Records'}
            </h1>
            <p className="text-xs text-[#5C6470]">
              View and manage your {meta?.[0]?.toLowerCase() || 'records'}.
            </p>
          </div>
        </div>

        {fields[kind] && (
          <button
            type="button"
            onClick={() => setEdit({})}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] shadow-sm transition hover:bg-[#FFA242]"
          >
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {msg && (
        <p role="status" className="notice">
          {msg}
        </p>
      )}

      {edit && (
        <form
          className="rounded-2xl border border-[#F3E5D3] bg-white p-6 shadow-sm"
          onSubmit={save}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#22262E]">
              {edit._id ? 'Update Record' : 'Add New Record'}
            </h2>
            <button
              type="button"
              onClick={() => setEdit(null)}
              aria-label="Close form"
              className="rounded-lg bg-[#FFF4E5] p-1.5 text-[#C25900] hover:bg-[#FFE0B8]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="formgrid">
            {fields[kind].map((k) => (
              <label key={k}>
                {formatFieldLabel(k)}
                {kind === 'pets' && petOptions[k] ? (
                  <select name={k} defaultValue={edit[k] || (k === 'vaccinationStatus' ? 'Unknown' : '')} required={k !== 'vaccinationStatus'} className="w-full rounded-xl border border-[#EBD8C3] bg-[#FFFBF5] px-3 py-3 text-sm text-[#2D3138] focus:border-[#FF8C1A] focus:outline-none focus:ring-2 focus:ring-orange-100">
                    <option value="" disabled>Select {formatFieldLabel(k).toLowerCase()}</option>
                    {edit[k] && !petOptions[k].includes(edit[k]) && <option value={edit[k]}>{edit[k]}</option>}
                    {petOptions[k].map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                <input
                  name={k}
                  autoComplete="off"
                  defaultValue={edit[k] ?? ''}
                  min={['age', 'weight'].includes(k) ? 0 : undefined}
                  step={['age', 'weight'].includes(k) ? 'any' : undefined}
                  type={
                    k === 'scheduledAt'
                      ? 'datetime-local'
                      : ['age', 'weight'].includes(k)
                      ? 'number'
                      : 'text'
                  }
                  required={[
                    'petName',
                    'species',
                    'pet',
                    'doctor',
                    'date',
                    'timeSlot',
                    'petId',
                    'doctorId',
                    'scheduledAt',
                    'reason',
                    'age',
                    'gender',
                  ].includes(k)}
                />
                )}
              </label>
            ))}
            {kind === 'pets' && (
              <label>
                Pet image
                <input type="file" name="petImage" accept="image/*" />
              </label>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] hover:bg-[#FFA242]"
            >
              Save
            </button>
            <button
              type="button"
              className="secondary rounded-xl bg-[#FFEAD1] px-5 py-2.5 text-sm font-semibold text-[#C25900] hover:bg-[#FFD8AA]"
              onClick={() => setEdit(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#F3E5D3] bg-white p-8 text-center text-sm text-[#5C6470]">
          Loading records…
        </div>
      ) : !error && !list.length ? (
        <div className="rounded-2xl border border-[#F3E5D3] bg-white p-8 text-center">
          <PawPrint size={34} className="mx-auto text-[#FFB347]" />
          <h3 className="mt-3 text-base font-bold text-[#22262E]">
            No records found
          </h3>
          <p className="mt-1 text-xs text-[#5C6470]">
            {fields[kind]
              ? 'Click "Add New" above to create your first entry.'
              : 'Records will appear here once available.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r, i) =>
            kind === 'pets' ? (
              <PetCard
                key={r._id ?? i}
                pet={r}
                onEdit={setEdit}
                onDelete={remove}
              />
            ) : kind === 'doctors' ? (
              <DoctorCard key={r._id ?? i} doctor={r} />
            ) : kind === 'appointments' ? (
              <AppointmentCard key={r._id ?? i} appointment={r} />
            ) : (
              <article
                className="rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#FFD39E] hover:shadow-md"
                key={r._id ?? i}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
                  <FileText size={18} />
                </div>
                <h3 className="text-base font-bold text-[#22262E]">
                  {r.petName ?? r.fullName ?? r.name ?? r.title ?? r.status ?? 'Record'}
                </h3>
                <div className="mt-2 space-y-1">
                  {Object.entries(r)
                    .filter(
                      ([k, v]) =>
                        !['_id', '__v', 'password', 'owner', 'googleId'].includes(
                          k
                        ) && ['string', 'number'].includes(typeof v)
                    )
                    .map(([k, v]) => (
                      <p key={k} className="text-xs text-[#5C6470]">
                        <span className="font-semibold capitalize text-[#2D3138]">
                          {formatFieldLabel(k)}:
                        </span>{' '}
                        {v}
                      </p>
                    ))}
                </div>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function PetCard({ pet, onEdit, onDelete }) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#FFD39E] hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
            <PawPrint size={19} />
          </span>
          {pet.vaccinationStatus && (
            <span className="rounded-full bg-[#FFF4E5] px-2.5 py-1 text-[11px] font-semibold text-[#C25900]">
              {pet.vaccinationStatus}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-bold text-[#22262E]">{pet.petName}</h3>
        <p className="mt-1 text-xs font-medium text-[#5C6470]">
          {pet.species} {pet.breed ? `· ${pet.breed}` : ''}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(pet)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FF8C1A] px-3 py-2 text-xs font-semibold text-[#2E1E0F] hover:bg-[#FFA242]"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          type="button"
          className="secondary inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FFEAD1] px-3 py-2 text-xs font-semibold text-[#C25900] hover:bg-[#FFD8AA]"
          onClick={() => onDelete(pet._id)}
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </article>
  );
}

export function DoctorCard({ doctor }) {
  const { user, ready } = useAuth();
  const bookingTarget = `/appointments?doctorId=${encodeURIComponent(doctor._id)}#appointment-form`;
  const canBook = doctor.isVerified && doctor.isActive && !doctor.isDemo;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#F3E5D3] bg-white shadow-xs transition hover:-translate-y-0.5 hover:border-[#FFD39E] hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-[#FFF4E5]">
        <img src={doctor.isDemo ? vetCareImage : doctor.user?.avatar || vetCareImage} alt={doctor.isDemo ? 'Illustrative veterinary care image' : 'Veterinary care'} loading="lazy" className="h-full w-full object-cover" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = vetCareImage; }} />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#C25900]">{doctor.isDemo ? 'Demo profile · Illustrative image' : doctor.isVerified ? 'Verified veterinarian' : 'Verification pending'}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
          <Stethoscope size={20} />
        </span>
        <div>
          <h3 className="text-base font-bold text-[#22262E]">
            {doctor.fullName ?? doctor.name ?? doctor.user?.fullName}
          </h3>
          <p className="text-xs font-semibold text-[#D96B08]">
            {doctor.specialization || 'Veterinary Specialist'}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-1 border-t border-[#F7EDE0] pt-3 text-xs text-[#5C6470]">
        {doctor.qualifications && <p>Qualification: {doctor.qualifications.join(', ')}</p>}
        <p className="font-semibold text-[#2D3138]">
          Consultation Fee: {doctor.consultationFee ?? 'Not set'}
        </p>
      </div>
      <div className="mt-auto pt-5">
          <Link to={user ? bookingTarget : loginForBooking(bookingTarget)} onClick={event => { if (!ready) event.preventDefault(); }} aria-disabled={!ready} className="flex items-center justify-center gap-2 rounded-xl bg-[#FF8C1A] px-4 py-3 text-sm font-semibold text-[#2E1E0F] transition hover:bg-[#FFA242]">
            <Calendar size={16} /> Book Appointment
          </Link>
          {!canBook && <p className="mt-2 text-center text-xs text-[#956331]">{doctor.isDemo ? 'Demo profile: explore the appointment form.' : 'Booking requires an active, verified doctor.'}</p>}
      </div>
      </div>
    </article>
  );
}

export function AppointmentCard({ appointment }) {
  return (
    <article className="rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-[#FFD39E] hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
          <Calendar size={18} />
        </span>
        <span className="rounded-full bg-[#FFF4E5] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#C25900]">
          {appointment.status || 'Scheduled'}
        </span>
      </div>
      <h3 className="mt-3 text-base font-bold text-[#22262E]">
        {appointment.pet?.petName ?? appointment.petDetails?.petName ?? 'Appointment'}
      </h3>
      <p className="mt-1 text-sm text-[#343E4E]">
        Doctor: {appointment.doctor?.user?.fullName || 'Name unavailable'}
      </p>
      <p className="mt-1 text-xs text-[#5C6470]">
        {new Date(appointment.scheduledAt).toLocaleString()}
      </p>
    </article>
  );
}

export const nav = [
  ['Dashboard', 'dashboard', LayoutDashboard],
  ['My pets', 'pets', PawPrint],
  ['Doctors', 'doctors', Stethoscope],
  ['Appointments', 'appointments', Calendar],
  ['Prescriptions', 'prescriptions', FileText],
  ['Medical history', 'medical', Heart],
  ['AI assistant', 'ai', Sparkles],
  ['Profile', 'profile', User],
];
