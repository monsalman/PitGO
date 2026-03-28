import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import MechanicTracker from './MechanicTracker';

const WorkshopDashboard = ({ user, onLogout }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });
    const [mechanics, setMechanics] = useState([]); // List of mechanics in workshop
    const [activeTab, setActiveTab] = useState(user?.role === 'mechanic' ? 'active' : 'new'); // new, active, history
    const [trackingBookingId, setTrackingBookingId] = useState(null);

    useEffect(() => {
        fetchBookings();
        fetchMechanics();

        // Listen for new bookings
        if (window.Echo && user?.workshop_id) {
            window.Echo.channel(`workshops.${user.workshop_id}`)
                .listen('.new.booking', (e) => {
                    setBookings(prev => [e.booking, ...prev]);
                    new Audio('/sounds/notification.mp3').play().catch(() => {});
                    alert("Pesanan Baru Masuk!");
                });
        }

        return () => {
            if (window.Echo && user?.workshop_id) window.Echo.leave(`workshops.${user.workshop_id}`);
        };
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/bookings');
            setBookings(res.data);
            const s = res.data.reduce((acc, b) => {
                if (b.status === 'pending') acc.pending++;
                else if (['accepted', 'on_the_way', 'arrived', 'in_progress'].includes(b.status)) acc.active++;
                else if (b.status === 'completed') acc.completed++;
                return acc;
            }, { pending: 0, active: 0, completed: 0 });
            setStats(s);
        } catch (err) {
            console.error("Fetch bookings failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMechanics = async () => {
        try {
            const res = await axios.get('/api/mechanics');
            setMechanics(res.data);
        } catch (err) {
            console.error("Fetch mechanics failed:", err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/bookings/${id}/status`, { status });
            fetchBookings();
        } catch (err) {
            alert("Gagal update status.");
        }
    };

    const acceptBooking = async (id, mechanicId) => {
        try {
            await axios.put(`/api/bookings/${id}/accept`, { mechanic_id: mechanicId });
            fetchBookings();
        } catch (err) {
            alert("Gagal menerima pesanan.");
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'new') return b.status === 'pending';
        if (activeTab === 'active') return ['accepted', 'on_the_way', 'arrived', 'in_progress'].includes(b.status);
        return ['completed', 'cancelled'].includes(b.status);
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar user={user} onLogout={onLogout} />
            
            <div className="max-w-7xl mx-auto px-6 pt-32">
                {/* Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {user?.role !== 'mechanic' && (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white flex items-center space-x-6">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl">📥</div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pesanan Baru</p>
                                <p className="text-3xl font-black text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    )}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white flex items-center space-x-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl">🔧</div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{user?.role === 'mechanic' ? 'Tugas Saya' : 'Sedang Proses'}</p>
                            <p className="text-3xl font-black text-gray-900">{stats.active}</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white flex items-center space-x-6">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl">🏆</div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Selesai</p>
                            <p className="text-3xl font-black text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-white w-fit">
                    {user?.role !== 'mechanic' && (
                        <button 
                            onClick={() => setActiveTab('new')}
                            className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white'}`}
                        >
                            Pesanan Masuk ({stats.pending})
                        </button>
                    )}
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white'}`}
                    >
                        {user?.role === 'mechanic' ? 'Aktif' : `Aktif (${stats.active})`}
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-gray-500 hover:bg-white'}`}
                    >
                        Riwayat
                    </button>
                </div>

                {/* Booking List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
                            <p className="text-gray-300 font-black text-2xl">Tidak ada pesanan di kategori ini.</p>
                        </div>
                    ) : (
                        filteredBookings.map(booking => (
                            <div key={booking.id} className="bg-white rounded-[2.5rem] shadow-xl border border-white p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all hover:scale-[1.01]">
                                <div className="flex items-start space-x-6">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-gray-100">
                                        {booking.vehicle_type === 'motor' ? '🏍️' : '🚗'}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <h3 className="text-xl font-black text-gray-900 uppercase">{booking.vehicle_brand}</h3>
                                            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full uppercase">{booking.problem_category}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 mb-3">{booking.user_address}</p>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">👤</div>
                                                <span className="text-xs font-black text-gray-700">{booking.user?.name}</span>
                                            </div>
                                            <div className="text-xs font-bold text-gray-400">• {new Date(booking.created_at).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    {booking.status === 'pending' ? (
                                        <div className="flex gap-3">
                                            <select 
                                                className="bg-gray-50 border-2 border-transparent focus:border-orange-600 rounded-xl px-4 py-3 text-xs font-black outline-none"
                                                onChange={(e) => acceptBooking(booking.id, e.target.value)}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Pilih Mekanik...</option>
                                                {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                            </select>
                                            <button className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 uppercase tracking-widest">Tolak</button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {['on_the_way', 'arrived', 'in_progress', 'completed'].map(status => (
                                                <button 
                                                    key={status}
                                                    onClick={() => updateStatus(booking.id, status)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${booking.status === status ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                                >
                                                    {status.replace('_', ' ')}
                                                </button>
                                            ))}
                                            
                                            {['accepted', 'on_the_way', 'arrived', 'in_progress'].includes(booking.status) && (
                                                <button 
                                                    onClick={() => setTrackingBookingId(trackingBookingId === booking.id ? null : booking.id)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2
                                                        ${trackingBookingId === booking.id ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${trackingBookingId === booking.id ? 'bg-white animate-ping' : 'bg-green-500'}`}></span>
                                                    <span>{trackingBookingId === booking.id ? 'GPS ON' : 'Aktifkan GPS'}</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    
                                    <MechanicTracker 
                                        bookingId={booking.id} 
                                        isTracking={trackingBookingId === booking.id} 
                                    />

                                    <button 
                                        onClick={() => window.open(`/booking/${booking.id}`, '_blank')}
                                        className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition-all shadow-lg active:scale-90"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkshopDashboard;
