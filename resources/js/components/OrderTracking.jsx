import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import Navbar from './Navbar';

// Custom Icons
const createMechanicIcon = () => L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="relative">
        <div class="w-12 h-12 bg-orange-600 rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
        </div>
        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-600 rotate-45 border-r border-b border-white"></div>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48]
});

const createUserIcon = () => L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

const MapCenterer = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) map.setView(coords, 15);
    }, [coords]);
    return null;
};

const OrderTracking = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mechanicPos, setMechanicPos] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await axios.get(`/api/bookings/${id}`);
                setBooking(res.data);
                if (res.data.mechanic_location) {
                    const [lat, lng] = res.data.mechanic_location.split(',').map(Number);
                    setMechanicPos([lat, lng]);
                }
            } catch (err) {
                console.error("Fetch booking failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();

        // Real-time updates via Laravel Echo
        if (window.Echo) {
            window.Echo.channel(`booking.${id}`)
                .listen('.status.updated', (e) => {
                    setBooking(e.booking);
                    if (e.booking.mechanic_location) {
                        const [lat, lng] = e.booking.mechanic_location.split(',').map(Number);
                        setMechanicPos([lat, lng]);
                    }
                });
        }

        return () => {
            if (window.Echo) window.Echo.leave(`booking.${id}`);
        };
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!booking) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-4">Pesanan Tidak Ditemukan</h1>
            <button onClick={() => navigate('/')} className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black">Kembali ke Beranda</button>
        </div>
    );

    const userPos = booking.user_location ? booking.user_location.split(',').map(Number) : null;

    const statusMap = {
        'pending': { label: 'Menunggu Konfirmasi', color: 'bg-gray-500', icon: '⏳' },
        'accepted': { label: 'Pesanan Diterima', color: 'bg-blue-600', icon: '✅' },
        'on_the_way': { label: 'Mekanik Menuju Lokasi', color: 'bg-orange-600', icon: '🏍️' },
        'arrived': { label: 'Mekanik Sudah Sampai', color: 'bg-green-600', icon: '📍' },
        'in_progress': { label: 'Sedang Diperbaiki', color: 'bg-yellow-500', icon: '🔧' },
        'completed': { label: 'Selesai', color: 'bg-green-700', icon: '🎉' },
        'cancelled': { label: 'Dibatalkan', color: 'bg-red-600', icon: '❌' },
    };

    const currentStatus = statusMap[booking.status] || statusMap.pending;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar user={user} />
            
            <div className="max-w-7xl mx-auto px-6 pt-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Map & Tracking */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden p-4 isolate">
                            <div className="h-[500px] rounded-[2.5rem] overflow-hidden relative border border-gray-100 shadow-inner">
                                <MapContainer center={userPos || [-6.2088, 106.8456]} zoom={15} className="w-full h-full">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {userPos && <Marker position={userPos} icon={createUserIcon()}><Popup>Lokasi Anda</Popup></Marker>}
                                    {mechanicPos && <Marker position={mechanicPos} icon={createMechanicIcon()}><Popup>Mekanik PitGO</Popup></Marker>}
                                    {userPos && mechanicPos && <Polyline positions={[userPos, mechanicPos]} color="#ea580c" weight={4} dashArray="10, 10" opacity={0.5} />}
                                    <MapCenterer coords={mechanicPos || userPos} />
                                </MapContainer>
                                
                                <div className="absolute top-8 left-8 z-[1000] flex items-center space-x-4 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-white">
                                    <div className={`w-3 h-3 rounded-full animate-ping ${currentStatus.color}`}></div>
                                    <span className="font-black text-gray-900 uppercase tracking-widest text-xs">{currentStatus.label}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Progress */}
                        <div className="bg-white rounded-[3rem] shadow-2xl border border-white p-10">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">Status Perbaikan</h2>
                            <div className="relative space-y-10 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-1 before:bg-gray-100">
                                {Object.entries(statusMap).map(([key, val], idx) => {
                                    const statuses = Object.keys(statusMap);
                                    const currentIndex = statuses.indexOf(booking.status);
                                    const thisIndex = statuses.indexOf(key);
                                    const isActive = thisIndex <= currentIndex;
                                    
                                    if (key === 'cancelled' && booking.status !== 'cancelled') return null;

                                    return (
                                        <div key={key} className={`relative flex items-center space-x-8 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                                            <div className={`relative z-10 w-12 h-12 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-xl transition-all ${isActive ? val.color : 'bg-gray-200'}`}>
                                                {val.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 leading-none mb-1">{val.label}</p>
                                                {isActive && <p className="text-xs font-bold text-gray-400">Diperbarui pada {new Date().toLocaleTimeString()}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-white p-8 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-widest text-center border-b border-gray-100 pb-4">Info Bengkel</h3>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-[1.5rem] border-4 border-white shadow-xl overflow-hidden mb-4">
                                    <img src={booking.workshop?.photo || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                </div>
                                <h4 className="text-xl font-black text-gray-900">{booking.workshop?.name}</h4>
                                <p className="text-sm font-bold text-gray-400 text-center mt-2 px-4">{booking.workshop?.address}</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl text-white p-8">
                            <h3 className="text-sm font-black text-orange-500 mb-6 uppercase tracking-[0.2em] text-center">Detail Kendaraan</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-4 border-b border-white/5">
                                    <span className="text-xs font-black text-gray-500 uppercase">Input</span>
                                    <span className="text-sm font-black uppercase">{booking.vehicle_type} - {booking.vehicle_brand}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-white/5">
                                    <span className="text-xs font-black text-gray-500 uppercase">Kategori</span>
                                    <span className="text-sm font-black flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        <span>{booking.problem_category}</span>
                                    </span>
                                </div>
                                <div className="space-y-2 py-4">
                                    <span className="text-xs font-black text-gray-500 uppercase">Keluhan:</span>
                                    <p className="text-xs font-bold text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic">
                                        "{booking.problem_description || 'Tidak ada deskripsi tambahan'}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-600 rounded-[2.5rem] shadow-2xl shadow-orange-600/30 text-white p-8 relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-[80px]"></div>
                            <div className="relative z-10 text-center">
                                <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-2">Estimasi Biaya Perbaikan</p>
                                <div className="text-3xl font-black mb-1">Rp {booking.estimated_cost_min?.toLocaleString()} - {booking.estimated_cost_max?.toLocaleString()}</div>
                                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Biaya Akhir ditentukan mekanik di lokasi</p>
                            </div>
                        </div>

                        <button className="w-full py-6 bg-white border-4 border-gray-100 rounded-3xl text-gray-400 font-black flex items-center justify-center space-x-3 transition-all hover:bg-gray-50 group">
                            <svg className="w-6 h-6 text-gray-300 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            <span className="text-sm uppercase tracking-widest">Batalkan Pesanan</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
