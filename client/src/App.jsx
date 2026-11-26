import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/AIAssistant';
import { Records } from './components/Records';
import { Profile } from './pages/Profile';
import { DoctorDashboard, DoctorAppointments, CreatePrescription } from './pages/DoctorDashboard';
import { AdminDashboard, AdminDoctors } from './pages/AdminDashboard';
import { MainLayout } from './components/MainLayout';
import { Doctors } from './pages/Doctors';
import { Appointments } from './pages/Appointments';
import { Sidebar, Topbar } from './components/Sidebar';
function Pages() {
    const { user, setUser } = useAuth();
    return <Routes>
    <Route element={<MainLayout />}><Route path="/" element={<Home user={user}/>}/><Route path="about" element={<About />}/><Route path="services" element={<Services />}/><Route path="contact" element={<Contact />}/><Route path="doctors" element={<Doctors/>}/><Route path="appointments" element={<Appointments/>}/>
    <Route path="login" element={<Auth setUser={setUser}/>}/><Route path="signup" element={<Auth signup setUser={setUser}/>}/></Route>
    <Route element={<ProtectedRoute />}>
      <Route path="app/dashboard" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard"/> : ['vet', 'doctor'].includes(user?.role) ? <Navigate to="/doctor/dashboard"/> : <PetOwnerLayout />}><Route index element={<Dashboard user={user}/>}/></Route>
      <Route element={<RoleRoute roles={['petOwner']}/>}><Route path="app" element={<PetOwnerLayout />}><Route path="ai" element={<Chat />}/><Route path="profile" element={<Profile user={user}/>}/>{['pets', 'doctors', 'appointments', 'prescriptions', 'medical'].map(k => <Route key={k} path={k} element={<Records key={k} kind={k}/>}/>)}</Route></Route>
      <Route element={<RoleRoute roles={['vet', 'doctor']}/>}><Route path="doctor" element={<DoctorLayout />}><Route path="dashboard" element={<DoctorDashboard />}/><Route path="appointments" element={<DoctorAppointments />}/><Route path="prescriptions/create" element={<CreatePrescription />}/><Route path="profile" element={<Profile user={user}/>}/></Route></Route>
      <Route element={<RoleRoute roles={['admin']}/>}><Route path="admin" element={<AdminLayout />}><Route path="dashboard" element={<AdminDashboard />}/><Route path="doctors" element={<AdminDoctors />}/><Route path="profile" element={<Profile user={user}/>}/></Route></Route>
    </Route><Route path="unauthorized" element={<Unauthorized />}/><Route path="*" element={<NotFound />}/>
  </Routes>;
}
export function AppRoutes() { return <AuthProvider><Pages /></AuthProvider>; }
export function ProtectedRoute() {
    const { user, ready } = useAuth();
    return !ready ? <p role="status">Loading…</p> : user ? <Outlet /> : <Navigate to="/login" replace/>;
}
export function RoleRoute({ roles }) {
    const { user } = useAuth();
    return roles.includes(user?.role) ? <Outlet /> : <Navigate to="/unauthorized" replace/>;
}

export function DashboardLayout({ links }) {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    return <div className="shell"><Sidebar links={links} open={open} close={() => setOpen(false)} logout={logout}/><main className="workspace"><Topbar user={user} toggle={() => setOpen(!open)}/><Outlet /></main></div>;
}
const petownerLinks = [
    ["Dashboard", "/app/dashboard"],
    ["My pets", "/app/pets"],
    ["Doctors", "/app/doctors"],
    // ["Appointments", "/app/appointments"],
    ["Prescriptions", "/app/prescriptions"],
    ["Medical history", "/app/medical"],
    ["AI assistant", "/app/ai"],
    ["Profile", "/app/profile"],
];
export function PetOwnerLayout() { return <DashboardLayout links={petownerLinks}/>; }
const doctorLinks = [["Dashboard", "/doctor/dashboard"], ["Appointments", "/doctor/appointments"], ["Create prescription", "/doctor/prescriptions/create"], ["Profile", "/doctor/profile"]];
export function DoctorLayout() { return <DashboardLayout links={doctorLinks}/>; }
const adminLinks = [["Dashboard", "/admin/dashboard"], ["Doctors", "/admin/doctors"], ["Profile", "/admin/profile"]];
export function AdminLayout() { return <DashboardLayout links={adminLinks}/>; }
export function NotFound() { return <main className='panel'><h1>Page not found</h1><Link to='/'>Return home</Link></main>; }
export function Unauthorized() { return <main className='panel'><h1>Access denied</h1><p>You do not have permission to view this page.</p></main>; }
export default AppRoutes;
