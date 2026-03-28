import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import Login from './Login';
import Register from './Register';
import Navbar from './Navbar';
import Management from './Management';
import axios from 'axios';
import BookingModal from './BookingModal';
import OrderTracking from './OrderTracking';
import WorkshopDashboard from './WorkshopDashboard';

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
            <div class="w-10 h-10 bg-orange-500 rounded-xl border-4 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90 overflow-hidden">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                </svg>
            </div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
};

const reverseGeocode = async (lat, lon) => {
    try {
        const response = await axios.get(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
        return response.data.display_name;
    } catch (err) {
        console.error("Reverse geocoding failed:", err);
        return "";
    }
};

const Dashboard = ({ user, onBookingClick, setUserLocation: setParentLocation, setUserAddress: setParentAddress }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [locationLabel, setLocationLabel] = useState("Mencari lokasi Anda...");
    const [workshops, setWorkshops] = useState([]);
    const [loadingWorkshops, setLoadingWorkshops] = useState(true);

    const handleBookingClick = (shop) => {
        onBookingClick(shop);
    };

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const response = await axios.get('/api/workshops');
                setWorkshops(response.data);
            } catch (err) {
                console.error("Failed to fetch workshops:", err);
            } finally {
                setLoadingWorkshops(false);
            }
        };
        fetchWorkshops();

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setParentLocation([latitude, longitude]);
                    setLocationLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    const addr = await reverseGeocode(latitude, longitude);
                    setUserAddress(addr);
                    setParentAddress(addr);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setUserLocation([-6.2088, 106.8456]);
                    setLocationLabel("Default: Jakarta");
                }
            );
        }
    }, []);

    const parseCoords = (locStr) => {
        if (!locStr) return null;
        const pts = locStr.split(',').map(Number);
        return pts.length === 2 && !isNaN(pts[0]) && !isNaN(pts[1]) ? pts : null;
    };

    const getDistance = (targetLoc) => {
        if (!userLocation || !targetLoc) return "?.? KM";
        const [lat1, lon1] = userLocation;
        const [lat2, lon2] = targetLoc;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return `${(R * c).toFixed(1)} KM`;
    };

    return (
        <div className="relative min-h-screen pb-20 overflow-hidden bg-gray-50/50 isolate pt-40">
            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                .leaflet-popup-content { margin: 0 !important; }
                .leaflet-popup-tip { display: none !important; }
            `}} />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-200/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>

            {/* Fitur Cards */}
            <div className="max-w-7xl mx-auto px-12 md:px-20 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-10 bg-orange-600 rounded-[2.5rem] text-white shadow-2xl shadow-orange-200 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden isolate">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/30">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" /></svg>
                        </div>
                        <h3 className="text-3xl font-[900] mb-3">Booking Servis</h3>
                        <p className="text-orange-100 font-bold text-lg">Jadwalkan perawatan rutin</p>
                    </div>
                    <div className="p-10 bg-red-600 rounded-[2.5rem] text-white shadow-2xl shadow-red-200 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden isolate">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 blur-xl"></div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/30">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <h3 className="text-3xl font-[900] mb-3">Mekanik Darurat</h3>
                        <p className="text-red-100 font-bold text-lg">Bantuan instan di lokasi</p>
                    </div>
                    <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden isolate">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-3xl font-[900] mb-3">Riwayat Pesanan</h3>
                        <p className="text-slate-400 font-bold text-lg">Lihat servis sebelumnya</p>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="max-w-7xl mx-auto px-12 md:px-20 mb-20">
                <div className="bg-white/30 backdrop-blur-2xl p-4 md:p-6 rounded-[3rem] shadow-[0_32px_128px_-32px_rgba(31,38,135,0.1)] border border-white/60 min-h-[500px] relative overflow-hidden group">
                    <div className="w-full h-[500px] rounded-[2.5rem] overflow-hidden relative z-0 shadow-inner border border-white/40">
                        {userLocation ? (
                            <MapContainer center={userLocation} zoom={14} scrollWheelZoom={true} className="w-full h-full">
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={userLocation} icon={createUserIcon()}>
                                    <Popup>
                                        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white">
                                            <span className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Posisi Anda</span>
                                        </div>
                                    </Popup>
                                </Marker>
                                {workshops.map(shop => {
                                    const coords = parseCoords(shop.location);
                                    if (!coords) return null;
                                    return (
                                        <Marker key={shop.id} position={coords} icon={createWorkshopIcon()}>
                                            <Popup maxWidth={420} className="custom-popup">
                                                <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white w-[380px] flex flex-col space-y-8">
                                                    <div className="flex space-x-6">
                                                        <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-xl flex-shrink-0 border-4 border-white">
                                                            <img src={shop.photo || 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=300'} alt={shop.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-2xl font-black text-gray-900 leading-tight mb-2">{shop.name}</h4>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 flex items-center space-x-1 text-orange-600">
                                                                    <span className="text-[10px]">★</span>
                                                                    <span className="font-black text-xs">{shop.rating || '5.0'}</span>
                                                                </div>
                                                                <span className="text-orange-400 font-bold text-xs">({shop.reviews_count || 0})</span>
                                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                                <span className="text-xs font-black text-gray-600 uppercase transition-colors">{getDistance(coords)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button className="py-4 bg-white border border-gray-100 text-gray-900 text-sm font-black rounded-xl hover:bg-gray-50 transition-all shadow-sm">Profil</button>
                                                        <button className="py-4 bg-orange-600 text-white text-sm font-black rounded-xl shadow-xl shadow-orange-100 hover:bg-orange-500 transition-all uppercase tracking-widest">Booking</button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                                <MapCenterer coords={userLocation} />
                            </MapContainer>
                        ) : (
                            <div className="w-full h-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-500 font-black text-lg">Mencari Lokasi...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Selected Workshops List */}
            <div className="max-w-7xl mx-auto px-12 md:px-20 mb-32">
                <div className="flex justify-between items-center mb-16 px-4">
                    <div>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tight mb-4">Tersedia Sekarang</h2>
                        <div className="flex items-center space-x-3 text-gray-500 font-bold text-lg">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Menampilkan bengkel aktif di sekitar Anda</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {loadingWorkshops ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white/40 p-6 rounded-[2.5rem] border border-gray-100 animate-pulse flex gap-8">
                                <div className="w-32 h-32 bg-gray-100 rounded-2xl flex-shrink-0"></div>
                                <div className="flex-1 space-y-4 py-2"><div className="h-6 bg-gray-100 rounded-full w-3/4"></div><div className="h-4 bg-gray-50 rounded-full w-1/2"></div></div>
                            </div>
                        ))
                    ) : [...workshops]
                        .sort((a, b) => (b.is_open ? 1 : 0) - (a.is_open ? 1 : 0))
                        .map((shop) => (
                            <div
                                key={shop.id}
                                className={`group relative bg-white/40 backdrop-blur-2xl p-7 rounded-[3rem] shadow-[0_32px_128px_-32px_rgba(31,38,135,0.08)] border border-white/80 flex flex-col sm:flex-row gap-8 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] isolate
                                ${!shop.is_open ? 'opacity-60 grayscale brightness-[0.8] cursor-not-allowed pointer-events-none' : 'hover:bg-white/60 hover:-translate-y-3 hover:shadow-[0_64px_128px_-32px_rgba(31,38,135,0.15)]'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent -z-10 rounded-[3rem]"></div>
                                <div className="relative w-full sm:w-44 h-44 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white flex-shrink-0">
                                    <img src={shop.photo || 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=400'} alt={shop.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" />
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className={`text-xl xl:text-2xl font-black transition-colors leading-tight truncate mb-1 ${shop.is_open ? 'text-gray-900 group-hover:text-orange-600' : 'text-gray-500'}`}>{shop.name}</h3>
                                            <div className="flex items-center space-x-2 text-gray-400 group-hover:text-gray-500 transition-colors">
                                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                                <p className="text-[11px] font-bold truncate">{shop.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-3">
                                                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border ${shop.is_open ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                                                    <span className={`${shop.is_open ? 'text-orange-500' : 'text-gray-400'} text-xs`}>★</span>
                                                    <span className={`${shop.is_open ? 'text-orange-600' : 'text-gray-500'} font-black text-xs`}>{shop.rating || '5.0'}</span>
                                                </div>
                                                <span className="text-orange-400 font-bold text-xs">({shop.reviews_count || 0})</span>
                                            </div>
                                            <span className="text-[10px] font-black text-gray-800">{getDistance(parseCoords(shop.location))}</span>
                                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                            <div className="flex items-center space-x-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                {shop.category === 'mobil' ? (
                                                    <><svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg><span className="text-[9px] font-black text-slate-600 uppercase">Mobil</span></>
                                                ) : shop.category === 'motor' ? (
                                                    <><svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.653 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-[9px] font-black text-slate-600 uppercase">Motor</span></>
                                                ) : (
                                                    <><svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg><span className="text-[9px] font-black text-slate-600 uppercase">Mobil & Motor</span></>
                                                )}
                                            </div>
                                            <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                            <span className={`text-[9px] font-[900] uppercase tracking-wider ${shop.is_open ? 'text-green-600' : 'text-red-500'}`}>
                                                {shop.is_open ? 'Buka' : 'Tutup'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6 sm:mt-0">
                                        <button className={`flex-1 py-3 border text-[10px] font-black rounded-xl transition-all shadow-sm ${shop.is_open ? 'bg-white border-gray-100 text-gray-900 hover:bg-gray-50 active:scale-95' : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'}`}>Profil</button>
                                        <button
                                            onClick={() => handleBookingClick(shop)}
                                            className={`flex-1 py-3 text-[10px] font-black rounded-xl shadow-lg transition-all uppercase tracking-widest leading-none ${shop.is_open ? 'bg-orange-600 text-white shadow-orange-600/20 hover:bg-orange-500 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
                                        >
                                            Booking
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

const MapCenterer = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView(coords, 14);
        }
    }, [coords, map]);
    return null;
};

const Hero = ({ onSearch, onUseLocation }) => {
    const [query, setQuery] = useState('');
    const [isLocating, setIsLocating] = useState(false);

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query);
        }
    };

    const handleLocate = () => {
        setIsLocating(true);
        onUseLocation(() => setIsLocating(false));
    };

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden isolate pt-40">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50/50 to-transparent pointer-events-none -z-10"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-200/30 rounded-full blur-[120px] -z-10 animate-pulse transition-all duration-1000"></div>
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-200/20 rounded-full blur-[100px] -z-10 transition-all duration-1000"></div>

            <div className="max-w-7xl mx-auto px-8 py-16 lg:py-24 flex flex-col lg:flex-row items-center">
                <div className="flex-1 z-10 text-center lg:text-left">
                    <div className="inline-flex items-center space-x-2 bg-white/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/60 shadow-sm mb-8 transition-all hover:bg-white/60">
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

                    <div className="flex flex-col sm:flex-row items-center bg-white/20 backdrop-blur-3xl p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 max-w-2xl group transition-all focus-within:ring-4 focus-within:ring-orange-100 focus-within:bg-white/30">
                        <div className="flex-1 flex items-center px-4 py-3 space-x-3">
                            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Masukkan lokasi Anda..."
                                className="bg-transparent border-none outline-none text-gray-900 font-black w-full placeholder:text-gray-400 text-lg"
                            />
                            <button
                                onClick={handleLocate}
                                disabled={isLocating}
                                className={`p-3 rounded-xl transition-all ${isLocating ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500 hover:bg-orange-600 hover:text-white hover:scale-110 active:scale-90'} shadow-sm border border-white relative group/loc`}
                                title="Gunakan Lokasi Saat Ini"
                            >
                                {isLocating ? (
                                    <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <circle cx="12" cy="11" r="3" strokeWidth="2.5" />
                                    </svg>
                                )}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover/loc:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">📍 Deteksi Lokasi</div>
                            </button>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="w-full sm:w-auto px-10 py-5 bg-orange-600 text-white font-black rounded-xl shadow-xl shadow-orange-300 hover:bg-orange-500 hover:-translate-y-0.5 active:scale-95 transition-all leading-none uppercase tracking-[0.1em] text-sm"
                        >
                            Cari Terdekat
                        </button>
                    </div>
                </div>

                <div className="flex-1 mt-16 lg:mt-0 relative w-full flex justify-center lg:justify-end">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-orange-500/20 rounded-[2rem] blur-2xl group-hover:bg-orange-500/30 transition-all duration-500"></div>

                        <div className="relative w-full max-w-[500px] h-[600px] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white group-hover:rotate-1 transition-all duration-500">
                            <img
                                src="/images/hero_mechanic.png"
                                alt="PitGO Mechanic"
                                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                        </div>

                        <div className="absolute bottom-10 -left-10 lg:-left-16 flex items-center space-x-4 bg-white/60 backdrop-blur-2xl p-5 rounded-2xl shadow-2xl border border-white group-hover:translate-x-2 transition-transform duration-500">
                            <div className="w-14 h-14 bg-orange-500/10 backdrop-blur-md rounded-xl flex items-center justify-center overflow-hidden border border-orange-500/20">
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
};

const SearchResults = ({ onBookingClick, setUserLocation: setParentLocation, setUserAddress: setParentAddress }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState("");
    const [locationLabel, setLocationLabel] = useState("Mencari lokasi...");
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [editQuery, setEditQuery] = useState("");

    const handleBookingClick = (shop) => {
        onBookingClick(shop);
    };

    const getDistance = (targetLoc) => {
        if (!userLocation || !targetLoc) return "?.? KM";
        const [lat1, lon1] = userLocation;
        const [lat2, lon2] = targetLoc;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return `${(R * c).toFixed(1)} KM`;
    };

    const parseCoords = (locStr) => {
        if (!locStr) return null;
        const pts = locStr.split(',').map(Number);
        return pts.length === 2 && !isNaN(pts[0]) && !isNaN(pts[1]) ? pts : null;
    };

    useEffect(() => {
        const lat = parseFloat(searchParams.get('lat'));
        const lng = parseFloat(searchParams.get('lng'));
        const query = searchParams.get('q');

        if (!isNaN(lat) && !isNaN(lng)) {
            setUserLocation([lat, lng]);
            setLocationLabel(query || `Lokasi: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            fetchNearbyWorkshops(lat, lng);
            reverseGeocode(lat, lng).then(setUserAddress);
        } else if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setParentLocation([latitude, longitude]);
                    setLocationLabel(`📍 Lokasi: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    fetchNearbyWorkshops(latitude, longitude);
                    const addr = await reverseGeocode(latitude, longitude);
                    setUserAddress(addr);
                    setParentAddress(addr);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    const defaultLoc = [-6.2088, 106.8456];
                    setUserLocation(defaultLoc);
                    setLocationLabel("Lokasi tidak dapat diakses (Default: Jakarta)");
                    fetchNearbyWorkshops(defaultLoc[0], defaultLoc[1]);
                    reverseGeocode(defaultLoc[0], defaultLoc[1]).then(setUserAddress);
                }
            );
        }
    }, [searchParams]);

    const fetchNearbyWorkshops = async (lat, lng) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/workshops/search?lat=${lat}&lon=${lng}&radius=50`);
            setWorkshops(response.data);
        } catch (error) {
            console.error("Failed to fetch search results:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationChange = async () => {
        if (!editQuery.trim()) return;
        setLoading(true);
        try {
            const response = await axios.get(`/api/geocode?q=${encodeURIComponent(editQuery)}`);
            if (response.data && response.data.location) {
                const [lat, lng] = response.data.location.split(',');
                setSearchParams({ lat, lng, q: editQuery });
                setIsEditingLocation(false);
            } else {
                alert("Lokasi tidak ditemukan.");
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
            alert("Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen pb-20 overflow-hidden bg-gray-50 isolate pt-24">
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
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/20 backdrop-blur-[40px] px-10 py-8 rounded-3xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] shadow-white/20">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Bengkel Terdekat</h1>
                        <p className="text-gray-500 font-bold text-lg">Menampilkan {workshops.length} bengkel dalam radius 50km dari lokasi Anda</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-3 px-8 py-4 bg-white/60 backdrop-blur-md border border-white rounded-xl font-black text-gray-700 hover:bg-white/80 active:scale-95 transition-all shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            <span>Filter</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-12 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="p-10 bg-orange-600 rounded-[2.5rem] text-white shadow-2xl shadow-orange-200 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden isolate">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/30">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" /></svg>
                        </div>
                        <h3 className="text-3xl font-[900] mb-3">Booking Servis</h3>
                        <p className="text-orange-100 font-bold text-lg">Jadwalkan perawatan rutin</p>
                    </div>
                    <div className="p-10 bg-red-600 rounded-[2.5rem] text-white shadow-2xl shadow-red-200 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden isolate">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16 blur-xl"></div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/30">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <h3 className="text-3xl font-[900] mb-3">Mekanik Darurat</h3>
                        <p className="text-red-100 font-bold text-lg">Bantuan instan di lokasi</p>
                    </div>
                    <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 group cursor-pointer hover:-translate-y-2 transition-all relative overflow-hidden isolate">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-8 border border-white/10">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-3xl font-[900] mb-3">Riwayat Pesanan</h3>
                        <p className="text-slate-400 font-bold text-lg">Lihat servis sebelumnya</p>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="max-w-7xl mx-auto px-12 md:px-20 mb-20">
                <div className="bg-white/30 backdrop-blur-2xl p-4 md:p-6 rounded-[3rem] shadow-[0_32px_128px_-32px_rgba(31,38,135,0.1)] border border-white/60 min-h-[400px] md:min-h-[500px] relative overflow-hidden group">
                    <div className="w-full h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden relative z-0 shadow-inner border border-white/40">
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
                                {workshops.map(shop => {
                                    const coords = parseCoords(shop.location);
                                    if (!coords) return null;
                                    return (
                                        <Marker key={shop.id} position={coords} icon={createWorkshopIcon()}>
                                            <Popup maxWidth={420} className="custom-popup">
                                                <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-white w-[380px] flex flex-col space-y-8">
                                                    <div className="flex space-x-6">
                                                        <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-xl flex-shrink-0 border-4 border-white">
                                                            <img src={shop.photo || 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=300'} alt={shop.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="text-2xl font-[900] text-gray-900 leading-tight">{shop.name}</h4>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 flex items-center space-x-1">
                                                                    <span className="text-orange-500 text-sm">★</span>
                                                                    <span className="text-orange-600 font-black text-sm">{shop.rating || '5.0'}</span>
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-400">({shop.reviews_count || 0})</span>
                                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                                <span className="text-xs font-black text-gray-600">{getDistance(coords)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button className="py-4 bg-white border border-gray-100 text-gray-900 text-sm font-black rounded-xl hover:bg-gray-50 transition-all shadow-sm">Profil</button>
                                                        <button className="py-4 bg-orange-600 text-white text-sm font-black rounded-xl shadow-xl shadow-orange-100 hover:bg-orange-500 transition-all">Booking</button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                                <MapCenterer coords={userLocation} />
                            </MapContainer>
                        ) : loading ? (
                            <div className="w-full h-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                                    <p className="text-gray-500 font-black text-xl">Mencari Bengkel Terdekat...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-gray-500 font-black text-xl">Silakan pilih lokasi terlebih dahulu.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location Badge Overlay */}
                    <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 bg-white/80 backdrop-blur-3xl p-5 md:p-6 rounded-[2.5rem] shadow-2xl border border-white/80 flex flex-col md:flex-row items-center justify-between z-[500] gap-4 transition-all group-hover:translate-y-[-5px] shadow-orange-600/5">
                        <div className="flex items-center space-x-6 flex-1 w-full md:w-auto">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-400/30 flex-shrink-0">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] leading-none mb-2">Area Pencarian Saat Ini</span>
                                {isEditingLocation ? (
                                    <input
                                        type="text"
                                        value={editQuery}
                                        onChange={(e) => setEditQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleLocationChange()}
                                        placeholder="Masukkan lokasi baru..."
                                        className="bg-transparent border-none outline-none text-gray-900 font-black text-xl w-full p-0 placeholder:text-gray-300"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-gray-900 font-black text-xl truncate tracking-tight">{locationLabel}</span>
                                )}
                            </div>
                        </div>
                        {isEditingLocation ? (
                            <div className="flex space-x-2 w-full md:w-auto justify-end">
                                <button onClick={() => setIsEditingLocation(false)} className="px-6 py-4 bg-gray-100 text-gray-500 font-black rounded-xl hover:bg-gray-200 transition-all text-xs tracking-widest uppercase">Batal</button>
                                <button onClick={handleLocationChange} className="px-8 py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-500 shadow-xl shadow-orange-600/20 transition-all text-xs tracking-widest uppercase">Ganti Lokasi</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setIsEditingLocation(true); setEditQuery(locationLabel); }}
                                className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-orange-600 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] shadow-2xl shadow-gray-900/20"
                            >
                                Ubah Alamat
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Workshops List Section */}
            <div className="max-w-7xl mx-auto px-12 md:px-20 mb-32">
                <div className="flex justify-between items-center mb-16 px-4">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">Pilihan Bengkel Terdekat</h1>
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-gray-500 font-bold text-lg">Ditemukan {workshops.length} bengkel aktif di sekitar lokasi Anda</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white/40 p-6 rounded-[2.5rem] border border-gray-100 animate-pulse flex gap-8">
                                <div className="w-32 h-32 bg-gray-100 rounded-2xl flex-shrink-0"></div>
                                <div className="flex-1 space-y-4 py-2">
                                    <div className="h-6 bg-gray-100 rounded-full w-3/4"></div>
                                    <div className="h-4 bg-gray-50 rounded-full w-1/2"></div>
                                    <div className="h-4 bg-gray-50 rounded-full w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : workshops.length === 0 ? (
                    <div className="text-center py-32 bg-white/20 backdrop-blur-2xl rounded-[4rem] border border-white/60 shadow-xl">
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-gray-100">
                            <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <p className="text-gray-400 font-black text-2xl max-w-lg mx-auto leading-relaxed">Maaf, kami belum menemukan bengkel di area pencarian Anda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {[...workshops]
                            .sort((a, b) => (b.is_open ? 1 : 0) - (a.is_open ? 1 : 0))
                            .map((shop) => (
                                <div
                                    key={shop.id}
                                    className={`group relative bg-white/40 backdrop-blur-2xl p-7 rounded-[3rem] shadow-[0_32px_128px_-32px_rgba(31,38,135,0.08)] border border-white/80 flex flex-col sm:flex-row gap-8 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] isolate
                                    ${!shop.is_open ? 'opacity-60 grayscale brightness-[0.8] cursor-not-allowed pointer-events-none' : 'hover:bg-white/60 hover:-translate-y-3 hover:shadow-[0_64px_128px_-32px_rgba(31,38,135,0.15)]'}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent -z-10 rounded-[3rem]"></div>
                                    <div className="relative w-full sm:w-44 h-44 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white flex-shrink-0">
                                        <img src={shop.photo || 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=400'} alt={shop.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className={`text-xl xl:text-2xl font-black transition-colors leading-tight truncate mb-1 ${shop.is_open ? 'text-gray-900 group-hover:text-orange-600' : 'text-gray-500'}`}>{shop.name}</h3>
                                                <div className="flex items-center space-x-2 text-gray-400 group-hover:text-gray-500 transition-colors">
                                                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                                    <p className="text-[11px] font-bold truncate">{shop.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border ${shop.is_open ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                                                        <span className={`${shop.is_open ? 'text-orange-500' : 'text-gray-400'} text-xs`}>★</span>
                                                        <span className={`${shop.is_open ? 'text-orange-600' : 'text-gray-500'} font-black text-xs`}>{shop.rating || '5.0'}</span>
                                                    </div>
                                                    <span className="text-orange-400 font-bold text-[10px]">({shop.reviews_count || 0})</span>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-800">{getDistance(parseCoords(shop.location))}</span>
                                                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                                <div className="flex items-center space-x-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    {shop.category === 'mobil' ? (
                                                        <><svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1-1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg><span className="text-[9px] font-black text-slate-600 uppercase">Mobil</span></>
                                                    ) : shop.category === 'motor' ? (
                                                        <><svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.653 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-[9px] font-black text-slate-600 uppercase">Motor</span></>
                                                    ) : (
                                                        <><svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg><span className="text-[9px] font-black text-slate-600 uppercase">Mobil & Motor</span></>
                                                    )}
                                                </div>
                                                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                                <span className={`text-[9px] font-[900] uppercase tracking-wider ${shop.is_open ? 'text-green-600' : 'text-red-500'}`}>
                                                    {shop.is_open ? 'Buka' : 'Tutup'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-6 sm:mt-0">
                                            <button className={`flex-1 py-3 border text-[10px] font-black rounded-xl transition-all shadow-sm ${shop.is_open ? 'bg-white border-gray-100 text-gray-900 hover:bg-gray-50 active:scale-95' : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'}`}>Profil</button>
                                            <button
                                                onClick={() => handleBookingClick(shop)}
                                                className={`flex-1 py-3 text-[10px] font-black rounded-xl shadow-lg transition-all shadow-orange-600/20 hover:bg-orange-500 ${shop.is_open ? 'bg-orange-600 text-white active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
                                            >
                                                Booking
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            <div className="mt-32 p-16 md:p-24 rounded-[4rem] bg-slate-900 overflow-hidden relative isolate shadow-3xl text-center">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full -mr-64 -mt-64 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full -ml-64 -mb-64 blur-[120px]"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-12 border border-white/10 shadow-inner">
                        <svg className="w-14 h-14 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h4 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">Belum Ada Bengkel <span className="text-orange-500 italic">Favoritmu?</span></h4>
                    <p className="text-gray-400 text-xl lg:text-2xl font-bold mb-16 max-w-2xl mx-auto opacity-80 leading-relaxed">Jangan khawatir, mitra bengkel kami terus bertambah setiap hari. Coba perluas area pencarian untuk menemukan teknisi terbaik.</p>
                    <button className="inline-flex items-center space-x-5 px-16 py-7 bg-orange-600 text-white font-[950] text-xl rounded-3xl shadow-3xl shadow-orange-600/50 hover:bg-orange-500 hover:-translate-y-2 transition-all group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
                        <span className="relative z-10 tracking-widest uppercase">Perluas Radius Pencarian</span>
                        <svg className="w-7 h-7 relative z-10 transition-transform group-hover:translate-x-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
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
                <div className="group p-12 bg-white/20 backdrop-blur-[45px] rounded-[2rem] border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] transition-all duration-700 hover:bg-white/30 hover:shadow-2xl hover:shadow-blue-200/30 hover:-translate-y-4">
                    <div className="w-20 h-20 bg-blue-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-700 border border-blue-500/20">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-[900] text-gray-900 mb-5 tracking-tight">Booking Servis</h3>
                    <p className="text-gray-600 font-bold leading-relaxed text-lg">
                        Jadwalkan perawatan rutin dengan bengkel lokal terpercaya hanya dalam hitungan detik.
                    </p>
                </div>

                <div className="group p-12 bg-white/20 backdrop-blur-[45px] rounded-[2rem] border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] transition-all duration-700 hover:bg-white/30 hover:shadow-2xl hover:shadow-red-200/30 hover:-translate-y-4">
                    <div className="w-20 h-20 bg-red-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-700 border border-red-500/20">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-[900] text-gray-900 mb-5 tracking-tight">Mekanik Kompak</h3>
                    <p className="text-gray-600 font-bold leading-relaxed text-lg">
                        Bantuan darurat di lokasi saat mogok, kempes ban, atau mati mesin di mana pun Anda berada.
                    </p>
                </div>

                <div className="group p-12 bg-white/40 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] transition-all duration-700 hover:bg-white/70 hover:shadow-2xl hover:shadow-orange-200/30 hover:-translate-y-4">
                    <div className="w-20 h-20 bg-orange-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-700 border border-orange-500/20">
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
                <span className="text-sm font-black text-orange-400 tracking-widest uppercase italic">PitGO Partner Program</span>
            </div>

            <h2 className="text-5xl lg:text-7xl font-black text-white mb-10 tracking-tight max-w-5xl mx-auto leading-[1.1]">
                Kembangkan Bisnis <span className="text-orange-500 italic drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">Bengkel Anda</span>
            </h2>

            <p className="text-gray-400 text-xl lg:text-2xl font-bold max-w-4xl mx-auto leading-relaxed mb-16 opacity-80">
                Terhubung dengan ribuan pemilik kendaraan di wilayah Anda. Platform terlengkap untuk manajemen pesanan dan pertumbuhan pendapatan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <button className="w-full sm:w-auto px-12 py-6 bg-orange-600 text-white font-[950] text-lg rounded-2xl shadow-2xl shadow-orange-600/40 hover:bg-orange-500 hover:shadow-orange-500/50 hover:-translate-y-2 transition-all active:scale-95 flex items-center justify-center space-x-4 group">
                    <span>Mulai Jadi Partner</span>
                    <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </button>
                <button className="w-full sm:w-auto px-12 py-6 bg-white/5 backdrop-blur-2xl text-white font-[950] text-lg rounded-2xl border border-white/10 hover:bg-white/15 shadow-xl hover:-translate-y-2 transition-all active:scale-95 border-b-white/20">
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
                    <div key={i} className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-orange-500/50 transition-all duration-500 shadow-2xl">
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
                        <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-2xl shadow-orange-600/20 group-hover:rotate-12 transition-transform duration-500">
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
                            <a key={soc} href="#" className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:bg-orange-600 hover:border-orange-500 hover:-translate-y-2 transition-all duration-500 shadow-xl">
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

                <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl"></div>
                    <h4 className="text-white font-[950] text-xl mb-4 tracking-tight">Stay Updated</h4>
                    <p className="text-gray-500 font-bold mb-8">Berlangganan tips perawatan gratis.</p>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email Anda"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-5 px-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-all font-bold text-lg shadow-inner"
                            />
                        </div>
                        <button className="w-full py-5 bg-orange-600 text-white font-black text-lg rounded-xl hover:bg-orange-500 hover:shadow-2xl hover:shadow-orange-600/20 active:scale-95 transition-all shadow-xl">
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

        <button className="fixed bottom-12 right-12 w-16 h-16 bg-white/80 backdrop-blur-3xl text-gray-900 rounded-2xl flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:scale-110 hover:-translate-y-2 active:scale-95 transition-all z-[100] border border-white group">
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
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const navigate = useNavigate();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [userAddress, setUserAddress] = useState("");

    const handleBookingClick = (shop) => {
        setSelectedWorkshop(shop);
        setIsBookingModalOpen(true);
    };

    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('/user');
                if (response.data && response.data.user) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.log('Session check: Not logged in');
                setUser(null);
            } finally {
                setAuthLoading(false);
            }
        };
        checkAuth();
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        if (userData.role === 'workshop' || userData.role === 'mechanic') {
            navigate('/workshop/dashboard');
        } else {
            navigate('/');
        }
    };

    const handleRegisterSuccess = (userData) => {
        setUser(userData);
        navigate('/');
    };

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            setUser(null);
            navigate('/');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900 scroll-smooth">
            {location.pathname !== '/login' && location.pathname !== '/register' && (
                <Navbar
                    user={user}
                    onLogout={handleLogout}
                />
            )}

            <Routes>
                <Route
                    path="/"
                    element={
                        user ? (
                            <Dashboard
                                user={user}
                                onBookingClick={handleBookingClick}
                                setUserLocation={setUserLocation}
                                setUserAddress={setUserAddress}
                            />
                        ) : (
                            <>
                                <Hero
                                    onSearch={async (query) => {
                                        try {
                                            const response = await axios.get(`/api/geocode?q=${encodeURIComponent(query)}`);
                                            if (response.data && response.data.location) {
                                                const [lat, lng] = response.data.location.split(',');
                                                navigate(`/results?lat=${lat}&lng=${lng}&q=${encodeURIComponent(query)}`);
                                            } else {
                                                alert("Lokasi tidak ditemukan. Silakan coba kata kunci lain.");
                                            }
                                        } catch (error) {
                                            console.error("Geocoding failed:", error);
                                            alert("Terjadi kesalahan saat mencari lokasi.");
                                        }
                                    }}
                                    onUseLocation={(callback) => {
                                        if ("geolocation" in navigator) {
                                            navigator.geolocation.getCurrentPosition(
                                                (position) => {
                                                    const { latitude, longitude } = position.coords;
                                                    navigate(`/results?lat=${latitude}&lng=${longitude}&q=Lokasi+Anda`);
                                                    if (callback) callback();
                                                },
                                                (error) => {
                                                    console.error("Geolocation error:", error);
                                                    alert("Izin lokasi ditolak atau tidak tersedia.");
                                                    if (callback) callback();
                                                }
                                            );
                                        } else {
                                            alert("Browser Anda tidak mendukung geolokasi.");
                                            if (callback) callback();
                                        }
                                    }}
                                />
                                <Solutions />
                                <Partners />
                            </>
                        )
                    }
                />
                <Route path="/results" element={
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <SearchResults
                            onBookingClick={handleBookingClick}
                            setUserLocation={setUserLocation}
                            setUserAddress={setUserAddress}
                        />
                    </div>
                } />
                <Route path="/login" element={
                    <Login
                        onLoginSuccess={handleLoginSuccess}
                        onBackToHome={() => navigate('/')}
                        onRegisterClick={() => navigate('/register')}
                    />
                } />
                <Route path="/register" element={
                    <Register
                        onRegisterSuccess={handleRegisterSuccess}
                        onBackToHome={() => navigate('/')}
                        onLoginClick={() => navigate('/login')}
                    />
                } />
                <Route path="/management" element={<Management />} />
                <Route path="/booking/:id" element={<OrderTracking user={user} />} />
                <Route path="/workshop/dashboard" element={<WorkshopDashboard user={user} onLogout={handleLogout} />} />
            </Routes>

            {location.pathname !== '/login' && location.pathname !== '/register' && <Footer />}

            {isBookingModalOpen && selectedWorkshop && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    workshop={selectedWorkshop}
                    userLocation={userLocation}
                    userAddress={userAddress}
                />
            )}
        </div>
    );
};

export default App;
