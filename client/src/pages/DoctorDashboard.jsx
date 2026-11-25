import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, Stethoscope } from 'lucide-react';
import { useData, api, rows } from '../services/api';
import { StatCard } from '../components/Sidebar';

const doctorStats = [
  { key: 'totalAppointments', label: 'Total Appointments', icon: CalendarDays },
  { key: 'upcomingAppointments', label: 'Upcoming Appointments', icon: Clock },
  { key: 'completedAppointments', label: 'Completed Appointments', icon: CheckCircle2 },
];

export function DoctorDashboard() {
  const { data, error, loading } = useData('/dashboard/doctor');
  const d = data?.dashboard;
  const stats = { totalAppointments: d?.totals.appointments, upcomingAppointments: d ? d.appointmentStats.pending + d.appointmentStats.confirmed : undefined, completedAppointments: d?.appointmentStats.completed };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
          <Stethoscope size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-[#22262E]">
            Doctor Dashboard
          </h1>
          <p className="text-xs text-[#5C6470]">
            Manage your consultations and upcoming pet visits.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="text-sm text-[#5C6470]">Loading…</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {doctorStats.map(({ key, label, icon }) => (
          <StatCard key={key} label={label} value={stats[key]} icon={icon} />
        ))}
      </div>
    </div>
  );
}

export function DoctorAppointments() {
  const { data, error, loading, load } = useData('/appointments/doctor');
  const [message, setMessage] = useState('');

  async function update(id, status) {
    try {
      await api(`/appointments/${id}/status`, 'PATCH', { status });
      load();
    } catch (e) {
      setMessage(e.message);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-[#22262E]">Appointments</h1>
      {(error || message) && <p className="error">{error || message}</p>}
      {loading && <p className="text-sm text-[#5C6470]">Loading…</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows(data, 'appointments').map((a) => (
          <article
            className="rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs"
            key={a._id}
          >
            <h3 className="text-base font-bold text-[#22262E]">
              {a.pet?.petName ?? a.petDetails?.petName ?? 'Appointment'}
            </h3>
            <p className="mt-1 text-xs text-[#5C6470]">
              {new Date(a.scheduledAt).toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-semibold capitalize text-[#C25900]">
              {a.status}
            </p>
            <button
              type="button"
              disabled={!['pending', 'confirmed'].includes(a.status)}
              onClick={() => update(a._id, a.status === 'pending' ? 'confirmed' : 'completed')}
              className="mt-4 w-full rounded-xl bg-[#FF8C1A] px-4 py-2 text-xs font-semibold text-[#2E1E0F] hover:bg-[#FFA242]"
            >
              {a.status === 'pending' ? 'Confirm appointment' : 'Mark completed'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function CreatePrescription() {
  const { data, error } = useData('/appointments/doctor');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const { appointment, diagnosis, instructions, ...medicine } =
      Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api('/prescriptions', 'POST', {
        appointmentId: appointment,
        diagnosis,
        advice: instructions,
        medicines: [{ name: medicine.medicineName, dosage: medicine.dosage, frequency: medicine.frequency, duration: medicine.duration }],
      });
      setMessage('Prescription saved');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-[#22262E]">
        Create Prescription
      </h1>
      {error && <p className="error">{error}</p>}

      <form className="panel formgrid" onSubmit={submit}>
        <label>
          Appointment
          <select name="appointment" required>
            <option value="">Select appointment</option>
            {rows(data, 'appointments').map((a) => (
              <option key={a._id} value={a._id}>
                {a.pet?.petName ?? a._id} · {a.date}
              </option>
            ))}
          </select>
        </label>
        {[
          'diagnosis',
          'medicineName',
          'dosage',
          'frequency',
          'duration',
          'instructions',
        ].map((k) => (
          <label key={k}>
            {k.replace(/([A-Z])/g, ' $1')}
            <input name={k} required />
          </label>
        ))}
        <button disabled={busy} className="sm:col-span-full">
          Save prescription
        </button>
      </form>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
    </div>
  );
}
