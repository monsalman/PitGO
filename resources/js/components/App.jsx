import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Login from './Login';
import Register from './Register';
import axios from 'axios';

// Custom Markers Styling
const createUserIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="relative">
            <div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
            <div class="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-2xl relative z-10"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

const createWorkshopIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="group relative">
            <div class="w-10 h-10 bg-orange-500 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                </svg>
            </div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
};

const Navbar = ({ onLogoClick, onLoginClick, onRegisterClick, user, onLogout }) => (
    <nav className="sticky top-0 z-[100] flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={onLogoClick}>
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 transition-transform hover:scale-105 active:scale-95">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                </svg>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">Pit<span className="text-orange-500 italic">GO</span></span>
        </div>
        <div className="hidden md:flex items-center space-x-10">
            <a href="#" onClick={(e) => { e.preventDefault(); onLogoClick(); }} className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors relative group">
                Beranda
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#" className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors relative group">
                Layanan
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#" className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors relative group">
                Cara Kerja
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#" className="text-sm font-bold text-gray-600 hover:text-orange-600 transition-colors relative group">
                Darurat
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </a>
        </div>
        <div className="flex items-center space-x-6">
            {user ? (
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-gray-400">
                            Hai, <span className="text-gray-900">{user.name}</span>
                        </span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            ) : (
                <>
                    <button
                        onClick={onLoginClick}
                        className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors"
                    >
                        Masuk
                    </button>
                    <button 
                        onClick={onRegisterClick}
                        className="px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-xl hover:bg-orange-600 hover:shadow-orange-200 transition-all active:scale-95"
                    >
                        Daftar Sekarang
                    </button>
                </>
            )}
        </div>
    </nav>
);

const Hero = ({ onSearch }) => (
    <div className="relative min-h-[calc(100vh-88px)] bg-gray-50 overflow-hidden isolate">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50/50 to-transparent pointer-events-none -z-10"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-200/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-200/20 rounded-full blur-[100px] -z-10 transition-all duration-1000"></div>

        <div className="max-w-7xl mx-auto px-8 py-16 lg:py-24 flex flex-col lg:flex-row items-center">
            <div className="flex-1 z-10 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-white/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/60 shadow-sm mb-8 transition-all hover:bg-white/60">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-500 tracking-wide uppercase">Dipercaya oleh 50.000+ pemilik kendaraan</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-[900] text-gray-900 leading-[1.1] mb-8 tracking-tight">
                    Cari Mekanik <br />
                    <span className="text-orange-500 drop-shadow-sm italic">Kapan Saja, Di Mana Saja</span>
                </h1>

                <p className="text-lg lg:text-xl text-gray-600 font-medium mb-12 max-w-xl leading-relaxed">
                    Cara termudah untuk memesan servis kendaraan atau mendapatkan bantuan darurat di jalan dari profesional bersertifikat di dekat Anda.
                </p>

                <div className="flex flex-col sm:flex-row items-center bg-white/40 backdrop-blur-2xl p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 max-w-2xl group transition-all focus-within:ring-4 focus-within:ring-orange-100 focus-within:bg-white/60">
                    <div className="flex-1 flex items-center px-4 py-3 space-x-3">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Masukkan lokasi Anda..."
                            className="bg-transparent border-none outline-none text-gray-800 font-bold w-full placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        onClick={onSearch}
                        className="w-full sm:w-auto px-10 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-300 hover:bg-orange-500 hover:shadow-orange-400 transition-all active:scale-95 leading-none"
                    >
                        Cari Terdekat
                    </button>
                </div>
            </div>

            <div className="flex-1 mt-16 lg:mt-0 relative w-full flex justify-center lg:justify-end">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-orange-500/20 rounded-[3rem] blur-2xl group-hover:bg-orange-500/30 transition-all duration-500"></div>

                    <div className="relative w-full max-w-[500px] h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group-hover:rotate-1 transition-all duration-500">
                        <img
                            src="/images/hero_mechanic.png"
                            alt="PitGO Mechanic"
                            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    </div>

                    <div className="absolute bottom-10 -left-10 lg:-left-16 flex items-center space-x-4 bg-white/60 backdrop-blur-2xl p-5 rounded-3xl shadow-2xl border border-white group-hover:translate-x-2 transition-transform duration-500">
                        <div className="w-14 h-14 bg-orange-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden border border-orange-500/20">
                            <svg className="w-7 h-7 text-orange-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xl font-black text-gray-900 leading-tight">Estimasi: 12 menit</div>
                            <div className="text-sm font-bold text-gray-600 leading-tight">Mekanik sedang menuju lokasi</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MapCenterer = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView(coords, 14);
        }
    }, [coords, map]);
    return null;
};

const SearchResults = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [locationLabel, setLocationLabel] = useState("Mencari lokasi Anda...");

    const workshops = [
        {
            id: 1,
            name: "Elite Auto Care",
            rating: "4.9",
            reviews: "128",
            distance: "1.2 km",
            services: ["Engine Repair", "Brakes", "Oil Change"],
            image: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=300",
            sosReady: true,
            coords: [-6.2088, 106.8456]
        },
        {
            id: 2,
            name: "Quick Fix Garage",
            rating: "4.7",
            reviews: "85",
            distance: "2.5 km",
            services: ["Tire Change", "Battery", "Diagnostics"],
            image: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&q=80&w=300",
            sosReady: true,
            coords: [-6.2146, 106.8451]
        },
        {
            id: 3,
            name: "Master Mechanics",
            rating: "4.5",
            reviews: "210",
            distance: "3.8 km",
            services: ["Transmission", "Electrical", "AC Repair"],
            image: "https://images.unsplash.com/photo-1487754180451-c456f719c141?auto=format&fit=crop&q=80&w=300",
            sosReady: false,
            coords: [-6.2200, 106.8500]
        }
    ];

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setLocationLabel(`📍 Lokasi: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setUserLocation([-6.2088, 106.8456]);
                    setLocationLabel("Lokasi tidak dapat diakses (Default: Jakarta)");
                }
            );
        }
    }, []);

    return (
        <div className="relative min-h-screen pb-20 overflow-hidden bg-gray-50 isolate">
            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-popup-content-wrapper {
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                }
                .leaflet-popup-tip {
                    display: none !important;
                }
            `}} />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>

            <div className="px-8 py-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/40 backdrop-blur-2xl px-10 py-8 rounded-[2.5rem] border border-white shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Bengkel Terdekat</h1>
                        <p className="text-gray-500 font-bold text-lg">Menampilkan 12 bengkel dalam radius 5km dari lokasi Anda</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-3 px-8 py-4 bg-white/60 backdrop-blur-md border border-white rounded-2xl font-black text-gray-700 hover:bg-white/80 active:scale-95 transition-all shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            <span>Filter</span>
                        </button>
                        <button className="flex items-center space-x-3 px-8 py-4 bg-red-600 text-white rounded-2xl font-black shadow-2xl shadow-red-200 hover:bg-red-500 active:scale-95 transition-all">
                            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span>Bantuan SOS</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="p-10 bg-orange-600 rounded-[3rem] text-white shadow-2xl shadow-orange-200 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden isolate">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" /></svg>
                        </div>
                        <h3 className="text-3xl font-[900] mb-3">Booking Servis</h3>
                        <p className="text-orange-100 font-bold text-lg">Jadwalkan perawatan rutin</p>
                    </div>
                    <div className="p-10 bg-red-600 rounded-[3rem] text-white shadow-2xl shadow-red-200 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden isolate">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 blur-xl"></div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <h3 className="text-3xl font-[900] mb-3">Mekanik Darurat</h3>
                        <p className="text-red-100 font-bold text-lg">Bantuan instan di lokasi</p>
                    </div>
                    <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl shadow-slate-200 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden isolate">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-3xl font-[900] mb-3">Riwayat Pesanan</h3>
                        <p className="text-slate-400 font-bold text-lg">Lihat servis sebelumnya</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-[1.8] bg-white/30 backdrop-blur-2xl p-6 rounded-[3.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/60 min-h-[700px] relative overflow-hidden group">
                        <div className="w-full h-[700px] rounded-[2.5rem] overflow-hidden relative z-0 shadow-inner border border-white/40">
                            {userLocation ? (
                                <MapContainer center={userLocation} zoom={14} scrollWheelZoom={true} className="w-full h-full">
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={userLocation} icon={createUserIcon()}>
                                        <Popup>
                                            <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white">
                                                <span className="font-[900] text-gray-900 uppercase tracking-widest text-[10px]">Posisi Anda</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                    {workshops.map(shop => (
                                        <Marker key={shop.id} position={shop.coords} icon={createWorkshopIcon()}>
                                            <Popup maxWidth={420} className="custom-popup">
                                                <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-white w-[380px] flex flex-col space-y-8 animate-in zoom-in-95 duration-300">
                                                    <div className="flex space-x-6">
                                                        <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-xl flex-shrink-0 border-4 border-white">
                                                            <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="text-2xl font-[900] text-gray-900 leading-tight">{shop.name}</h4>
                                                                {shop.sosReady && (
                                                                    <div className="bg-[#ff8a8a] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-red-100 flex-shrink-0">SOS READY</div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 flex items-center space-x-1">
                                                                    <span className="text-orange-500 text-sm">★</span>
                                                                    <span className="text-orange-600 font-black text-sm">{shop.rating}</span>
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-400">({shop.reviews} reviews)</span>
                                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                                <span className="text-xs font-black text-gray-600">{shop.distance}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3">
                                                        {shop.services.map((service, i) => (
                                                            <span key={i} className="text-[11px] font-black bg-gray-50 text-gray-600 px-4 py-2.5 rounded-2xl border border-gray-100/50">{service}</span>
                                                        ))}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button className="py-4 bg-white border border-gray-100 text-gray-900 text-sm font-black rounded-2xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm">Profil</button>
                                                        <button className="py-4 bg-orange-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-500 active:scale-95 transition-all">Booking</button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                    <MapCenterer coords={userLocation} />
                                </MapContainer>
                            ) : (
                                <div className="w-full h-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                        <p className="text-gray-500 font-black text-xl">Menyiapkan Lokasi...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-12 left-10 right-10 bg-white/60 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-white/80 flex items-center justify-between z-[500] transition-transform group-hover:translate-y-[-5px]">
                            <div className="flex items-center space-x-5">
                                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-orange-600 uppercase tracking-widest leading-none mb-1">Lokasi Terdeteksi</span>
                                    <span className="text-gray-900 font-[800] text-lg">{locationLabel}</span>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-orange-600 active:scale-95 transition-all text-sm">Ubah</button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-8">
                        <div className="flex justify-between items-center mb-10 px-2">
                            <h2 className="text-3xl font-[900] text-gray-900 tracking-tight">Tersedia Sekarang</h2>
                            <button className="text-orange-600 font-black text-sm hover:underline flex items-center space-x-2 group">
                                <span>Lihat Semua</span>
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>

                        {workshops.map((shop) => (
                            <div key={shop.id} className="bg-white/40 backdrop-blur-2xl p-8 rounded-[3rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/60 flex flex-col space-y-8 hover:bg-white/60 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group">
                                <div className="flex space-x-8">
                                    <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl flex-shrink-0 border-4 border-white/80 transition-transform group-hover:scale-105">
                                        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors leading-tight mb-2">{shop.name}</h3>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm font-black text-orange-600 bg-orange-50 backdrop-blur-md px-3 py-1 rounded-lg border border-orange-100 flex items-center space-x-1">
                                                        <span>★</span>
                                                        <span>{shop.rating}</span>
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-400">({shop.reviews})</span>
                                                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                                    <span className="text-sm font-black text-gray-600">{shop.distance}</span>
                                                </div>
                                            </div>
                                            {shop.sosReady && (
                                                <div className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter animate-pulse shadow-lg shadow-red-200">SOS Ready</div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-6">
                                            {shop.services.map((service, i) => (
                                                <span key={i} className="text-[11px] font-black bg-white/60 text-gray-600 px-4 py-2 rounded-xl border border-white/80">{service}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <button className="py-4 bg-white/70 text-gray-900 text-sm font-black rounded-2xl hover:bg-white active:scale-95 transition-all shadow-sm">Profil</button>
                                    <button className="py-4 bg-orange-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-500 active:scale-95 transition-all">Booking</button>
                                </div>
                            </div>
                        ))}

                        <div className="p-10 rounded-[3rem] bg-gray-900/95 backdrop-blur-2xl text-center relative overflow-hidden isolate shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <h4 className="text-2xl font-black text-white mb-3">Tidak Menemukan Bengkel?</h4>
                            <p className="text-gray-500 font-bold mb-8 leading-relaxed">Coba perluas radius pencarian Anda untuk melihat lebih banyak pilihan.</p>
                            <button className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-600/30 hover:bg-orange-500 hover:-translate-y-1 transition-all flex items-center justify-center space-x-3">
                                <span>Perluas Radius</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Solutions = () => (
    <div className="relative py-24 bg-gray-50/30 overflow-hidden isolate">
        <div className="absolute top-24 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-24 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-[100px] -z-10 animate-pulse transition-all duration-1000"></div>

        <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">Solusi Lengkap <span className="text-orange-500 italic">di Jalan</span></h2>
                <p className="text-gray-500 text-lg lg:text-xl font-bold max-w-2xl mx-auto leading-relaxed">
                    Semua yang Anda butuhkan untuk menjaga kendaraan tetap prima, kapan saja dan di mana saja.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="group p-12 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] transition-all duration-700 hover:bg-white/70 hover:shadow-2xl hover:shadow-blue-200/30 hover:-translate-y-4">
                    <div className="w-20 h-20 bg-blue-500/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-700 border border-blue-500/20">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-[900] text-gray-900 mb-5 tracking-tight">Booking Servis</h3>
                    <p className="text-gray-600 font-bold leading-relaxed text-lg">
                        Jadwalkan perawatan rutin dengan bengkel lokal terpercaya hanya dalam hitungan detik.
                    </p>
                </div>

                <div className="group p-12 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] transition-all duration-700 hover:bg-white/70 hover:shadow-2xl hover:shadow-red-200/30 hover:-translate-y-4">
                    <div className="w-20 h-20 bg-red-500/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-700 border border-red-500/20">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-[900] text-gray-900 mb-5 tracking-tight">Mekanik Kompak</h3>
                    <p className="text-gray-600 font-bold leading-relaxed text-lg">
                        Bantuan darurat di lokasi saat mogok, kempes ban, atau mati mesin di mana pun Anda berada.
                    </p>
                </div>

                <div className="group p-12 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] transition-all duration-700 hover:bg-white/70 hover:shadow-2xl hover:shadow-orange-200/30 hover:-translate-y-4">
                    <div className="w-20 h-20 bg-orange-500/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-700 border border-orange-500/20">
                        <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-[900] text-gray-900 mb-5 tracking-tight">Cepat & Handal</h3>
                    <p className="text-gray-600 font-bold leading-relaxed text-lg">
                        Waktu tunggu rata-rata di bawah 25 menit. Kepuasan Anda adalah prioritas utama kami.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const Partners = () => (
    <div className="relative py-32 bg-[#0a0f1d] overflow-hidden isolate section-glow">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-orange-600/15 rounded-full blur-[150px] -z-10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none -z-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

        <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 mb-10 shadow-xl transition-all hover:bg-white/15">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping"></div>
                <span className="text-sm font-black text-orange-400 tracking-widest uppercase italic">Elite Partner Program</span>
            </div>

            <h2 className="text-5xl lg:text-7xl font-black text-white mb-10 tracking-tight max-w-5xl mx-auto leading-[1.1]">
                Kembangkan Bisnis <span className="text-orange-500 italic drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">Bengkel Anda</span>
            </h2>

            <p className="text-gray-400 text-xl lg:text-2xl font-bold max-w-4xl mx-auto leading-relaxed mb-16 opacity-80">
                Terhubung dengan ribuan pemilik kendaraan di wilayah Anda. Platform terlengkap untuk manajemen pesanan dan pertumbuhan pendapatan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <button className="w-full sm:w-auto px-12 py-6 bg-orange-600 text-white font-[950] text-lg rounded-[2.5rem] shadow-2xl shadow-orange-600/40 hover:bg-orange-500 hover:shadow-orange-500/50 hover:-translate-y-2 transition-all active:scale-95 flex items-center justify-center space-x-4 group">
                    <span>Mulai Jadi Partner</span>
                    <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </button>
                <button className="w-full sm:w-auto px-12 py-6 bg-white/5 backdrop-blur-2xl text-white font-[950] text-lg rounded-[2.5rem] border border-white/10 hover:bg-white/15 shadow-xl hover:-translate-y-2 transition-all active:scale-95 border-b-white/20">
                    Pelajari Detail
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24">
                {[
                    { val: '200+', label: 'Bengkel Aktif' },
                    { val: '15k+', label: 'Servis/Bulan' },
                    { val: '4.8', label: 'Rating Rata-rata' },
                    { val: '30%', label: 'Kenaikan Profit' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:border-orange-500/50 transition-all duration-500 shadow-2xl">
                        <div className="text-3xl font-black text-white mb-1">{stat.val}</div>
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const Footer = () => (
    <footer className="bg-[#0a0f1d] border-t border-white/10 pt-32 pb-12 relative overflow-hidden isolate">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-[80px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center space-x-3 mb-10 group cursor-pointer">
                        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-600/20 group-hover:rotate-12 transition-transform duration-500">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                            </svg>
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">Pit<span className="text-orange-500 italic italic-glow">GO</span></span>
                    </div>
                    <p className="text-gray-500 font-bold text-lg leading-relaxed mb-10">
                        Merevolusi cara Anda merawat kendaraan. Bantuan instan, servis transparan, dan kenyamanan tanpa batas.
                    </p>
                    <div className="flex space-x-5">
                        {['facebook-f', 'instagram', 'twitter', 'linkedin-in'].map(soc => (
                            <a key={soc} href="#" className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:bg-orange-600 hover:border-orange-500 hover:-translate-y-2 transition-all duration-500 shadow-xl">
                                <i className={`fab fa-${soc} text-lg`}></i>
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-[950] text-xl mb-10 tracking-tight uppercase">Layanan</h4>
                    <ul className="space-y-6">
                        {['Cari Bengkel', 'Mekanik Panggilan', 'Diagnosis AI', 'Booking Servis'].map(item => (
                            <li key={item}><a href="#" className="text-gray-500 font-bold text-lg hover:text-orange-500 transition-colors flex items-center space-x-2 group">
                                <span className="w-0 group-hover:w-4 h-0.5 bg-orange-500 transition-all"></span>
                                <span>{item}</span>
                            </a></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-[950] text-xl mb-10 tracking-tight uppercase">Perusahaan</h4>
                    <ul className="space-y-6">
                        {['Tentang PitGO', 'Jaringan Partner', 'Peluang Karir', 'Hubungi Kami'].map(item => (
                            <li key={item}><a href="#" className="text-gray-500 font-bold text-lg hover:text-orange-500 transition-colors flex items-center space-x-2 group">
                                <span className="w-0 group-hover:w-4 h-0.5 bg-orange-500 transition-all"></span>
                                <span>{item}</span>
                            </a></li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl"></div>
                    <h4 className="text-white font-[950] text-xl mb-4 tracking-tight">Stay Updated</h4>
                    <p className="text-gray-500 font-bold mb-8">Berlangganan tips perawatan gratis.</p>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email Anda"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-bold text-lg shadow-inner"
                            />
                        </div>
                        <button className="w-full py-5 bg-orange-600 text-white font-black text-lg rounded-2xl hover:bg-orange-500 hover:shadow-2xl hover:shadow-orange-600/20 active:scale-95 transition-all shadow-xl">
                            Langganan Sekarang
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                    <p className="text-gray-600 font-bold text-sm">
                        © 2026 PitGO Technology Inc. All Rights Reserved.
                    </p>
                    <div className="flex space-x-6 justify-center">
                        <a href="#" className="text-gray-600 font-bold text-sm hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="text-gray-600 font-bold text-sm hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
                <div className="flex items-center space-x-4 px-6 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-500 text-xs font-black tracking-widest uppercase italic">System Operational</span>
                </div>
            </div>
        </div>

        <button className="fixed bottom-12 right-12 w-16 h-16 bg-white/80 backdrop-blur-3xl text-gray-900 rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:scale-110 hover:-translate-y-2 active:scale-95 transition-all z-[100] border border-white group">
            <span className="text-2xl font-black group-hover:rotate-12 transition-transform inline-block">?</span>
            <div className="absolute -top-12 right-0 bg-gray-900 text-white text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">Butuh Bantuan?</div>
        </button>

        <style dangerouslySetInnerHTML={{
            __html: `
            .italic-glow { filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.4)); }
            .section-glow::after {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.05) 0%, transparent 70%);
                pointer-events: none;
            }
        `}} />
    </footer>
);

const App = () => {
    const [view, setView] = useState('home');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/user');
                setUser(response.data);
            } catch (err) {
                console.log('Not logged in');
            }
        };
        checkAuth();
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setView('home');
    };

    const handleRegisterSuccess = (userData) => {
        setUser(userData);
        setView('home');
    };

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            setUser(null);
            setView('home');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    if (view === 'login') {
        return (
            <Login
                onLoginSuccess={handleLoginSuccess}
                onBackToHome={() => setView('home')}
            />
        );
    }

    if (view === 'register') {
        return (
            <Register 
                onRegisterSuccess={handleRegisterSuccess} 
                onBackToHome={() => setView('home')}
                onLoginClick={() => setView('login')}
            />
        );
    }

    return (
        <div className="min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900 scroll-smooth">
            <Navbar
                onLogoClick={() => setView('home')}
                onLoginClick={() => setView('login')}
                onRegisterClick={() => setView('register')}
                user={user}
                onLogout={handleLogout}
            />

            {view === 'home' ? (
                <>
                    <Hero onSearch={() => setView('results')} />
                    <Solutions />
                    <Partners />
                </>
            ) : view === 'results' ? (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <SearchResults />
                </div>
            ) : null}

            <Footer />
        </div>
    );
};

export default App;
