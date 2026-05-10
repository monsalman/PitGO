import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const reverseGeocode = async (lat, lon) => {
    try {
        const response = await axios.get(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
        return response.data.display_name;
    } catch (err) {
        console.error("Reverse geocoding detailed error:", err);
        return `Koordinat: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    }
};

const BookingModal = ({ isOpen, onClose, workshop, userLocation, userAddress }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        vehicle_type: 'motor',
        vehicle_brand: '',
        vehicle_year: '',
        problem_category: '',
        problem_description: '',
        user_location: userLocation ? `${userLocation[0]},${userLocation[1]}` : '',
        detected_address: userAddress || '',
        additional_details: '', // New field for user manual input
    });

    // Synchronize with parent location/address when they change
    useEffect(() => {
        if (userLocation) {
            setFormData(prev => ({
                ...prev,
                user_location: `${userLocation[0]},${userLocation[1]}`
            }));
        }
    }, [userLocation]);

    useEffect(() => {
        if (userAddress) {
            setFormData(prev => ({
                ...prev,
                detected_address: userAddress
            }));
        }
    }, [userAddress]);

    // Update address when location changes in the modal (dragging, clicking map, or refresh)
    useEffect(() => {
        if (formData.user_location) {
            const [lat, lng] = formData.user_location.split(',').map(Number);

            const updateAddress = async () => {
                // Set temporary loading state
                setAddressLoading(true);
                setFormData(prev => ({ ...prev, detected_address: 'Mengambil alamat...' }));

                try {
                    const addr = await reverseGeocode(lat, lng);
                    console.log("Updated address result:", addr);
                    setFormData(prev => ({ ...prev, detected_address: addr }));
                } catch (error) {
                    console.error("Effect geocode error:", error);
                    setFormData(prev => ({ ...prev, detected_address: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}` }));
                } finally {
                    setAddressLoading(false);
                }
            };

            const timeoutId = setTimeout(updateAddress, 500); // Debounce
            return () => clearTimeout(timeoutId);
        }
    }, [formData.user_location]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const categories = [
        {
            id: 'Ban & Roda',
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            subs: ['Ban bocor', 'Ban pecah', 'Velg bengkok', 'Pentil rusak']
        },
        {
            id: 'Kelistrikan',
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
            subs: ['Aki/Baterai rusak', 'Kelistrikan konslet', 'Lampu mati', 'Starter rusak']
        },
        {
            id: 'Mesin',
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.98 7.98 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14l2.985-3.015A3 3 0 1014.121 16.121" /></svg>,
            subs: ['Mesin mati total', 'Mesin overheat', 'Mesin brebet', 'Oli bocor']
        },
        {
            id: 'Transmisi',
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
            subs: ['Rantai putus', 'Kopling slip', 'Gigi sulit masuk', 'CVT bermasalah']
        },
        {
            id: 'Rem',
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
            subs: ['Rem blong', 'Kampas rem habis', 'Master rem bocor']
        },
        {
            id: 'Bahan Bakar',
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
            subs: ['Bensin habis', 'Karburator bermasalah', 'Injektor kotor']
        },
        {
            id: 'Kunci & Body',
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
            subs: ['Kunci hilang/patah', 'Jok rusak', 'Spion patah']
        },
        {
            id: 'Lainnya',
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
            subs: []
        },
    ];

    const getEstimate = (cat) => {
        const map = {
            'Ban & Roda': 'Rp 30k - 80k',
            'Kelistrikan': 'Rp 50k - 250k',
            'Mesin': 'Rp 75k - 300k',
            'Transmisi': 'Rp 40k - 150k',
            'Rem': 'Rp 50k - 200k',
            'Bahan Bakar': 'Rp 30k - 200k',
            'Kunci & Body': 'Rp 25k - 150k',
            'Lainnya': 'Sesuai Pengecekan',
        };
        return map[cat] || 'TBD';
    };

    const handleRefreshLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({
                        ...prev,
                        user_location: `${latitude},${longitude}`
                    }));
                },
                (error) => {
                    console.error("Error refreshing location:", error);
                    alert("Gagal mengambil lokasi terbaru.");
                }
            );
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            if (!formData.user_location) {
                setErrorMessage('Lokasi belum siap. Izinkan akses lokasi lalu coba lagi.');
                return;
            }

            if (addressLoading || !formData.detected_address || formData.detected_address === 'Mengambil alamat...') {
                setErrorMessage('Alamat belum selesai dimuat. Tunggu sebentar lalu coba lagi.');
                return;
            }

            // Combine detected address and additional details for the backend
            const finalAddress = formData.additional_details
                ? `${formData.detected_address} (${formData.additional_details})`
                : formData.detected_address;

            const res = await axios.post('/api/bookings', {
                workshop_id: workshop.id,
                vehicle_type: formData.vehicle_type,
                vehicle_brand: formData.vehicle_brand,
                vehicle_year: formData.vehicle_year,
                problem_category: formData.problem_category,
                problem_description: formData.problem_description,
                user_location: formData.user_location,
                user_address: finalAddress,
            });
            window.location.href = `/booking/${res.data.id}`;
        } catch (err) {
            console.error("Booking failed:", err);
            const validationError = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().filter(Boolean)[0]
                : null;
            setErrorMessage(
                validationError
                || err.response?.data?.message
                || err.response?.data?.error
                || 'Gagal melakukan booking. Silakan coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative bg-white/90 backdrop-blur-2xl w-full max-w-2xl rounded-[3rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.3)] border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-none mb-2">Booking {workshop.name}</h2>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-orange-600' : 'w-4 bg-gray-200'}`}></div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all active:scale-90">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-10 max-h-[70vh] overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <h3 className="text-xl font-black text-gray-800">Pilih Jenis Kendaraan</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <button
                                    onClick={() => { setFormData({ ...formData, vehicle_type: 'motor' }); nextStep(); }}
                                    className={`p-8 rounded-[2rem] border-4 transition-all group ${formData.vehicle_type === 'motor' ? 'border-orange-600 bg-orange-50' : 'border-gray-100 bg-gray-50/50 hover:border-orange-200'}`}
                                >
                                    <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    </div>
                                    <span className="text-lg font-black text-gray-900 block text-center">MOTOR</span>
                                </button>
                                <button
                                    onClick={() => { setFormData({ ...formData, vehicle_type: 'mobil' }); nextStep(); }}
                                    className={`p-8 rounded-[2rem] border-4 transition-all group ${formData.vehicle_type === 'mobil' ? 'border-orange-600 bg-orange-50' : 'border-gray-100 bg-gray-50/50 hover:border-orange-200'}`}
                                >
                                    <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1" /></svg>
                                    </div>
                                    <span className="text-lg font-black text-gray-900 block text-center">MOBIL</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <h3 className="text-xl font-black text-gray-800">Detail Kendaraan</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Merek Kendaraan</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Honda Vario, Toyota Avanza..."
                                        className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-orange-600 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold placeholder:text-gray-300"
                                        value={formData.vehicle_brand}
                                        onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Tahun (Opsional)</label>
                                    <input
                                        type="text"
                                        placeholder="2022"
                                        className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-orange-600 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold placeholder:text-gray-300"
                                        value={formData.vehicle_year}
                                        onChange={(e) => setFormData({ ...formData, vehicle_year: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <h3 className="text-xl font-black text-gray-800">Pilih Kendala</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFormData({ ...formData, problem_category: cat.id })}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-3 ${formData.problem_category === cat.id ? 'border-orange-600 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-orange-100'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.problem_category === cat.id ? 'bg-orange-600 text-white' : 'bg-white text-gray-400'}`}>
                                            {cat.icon}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${formData.problem_category === cat.id ? 'text-orange-900' : 'text-gray-500'}`}>{cat.id}</span>
                                    </button>
                                ))}
                            </div>

                            {formData.problem_category && (
                                <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in duration-500">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Deskripsi Kendala</label>
                                        <textarea
                                            placeholder="Jelaskan detail kendala Anda (misal: mesin kasar, ban depan bocor, dsb)..."
                                            className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-orange-600 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold min-h-[120px]"
                                            value={formData.problem_description}
                                            onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-xl flex items-center justify-between border border-orange-100">
                                        <span className="text-sm font-bold text-orange-800">Estimasi Biaya:</span>
                                        <span className="text-lg font-black text-orange-600">{getEstimate(formData.problem_category)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                            <h3 className="text-xl font-black text-gray-800">Konfirmasi Lokasi</h3>

                            <div className="w-full h-64 rounded-[2rem] overflow-hidden shadow-inner border-4 border-white relative z-0">
                                {formData.user_location ? (
                                    <MapContainer
                                        center={formData.user_location.split(',').map(Number)}
                                        zoom={14}
                                        scrollWheelZoom={false}
                                        className="w-full h-full"
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker
                                            draggable={true}
                                            eventHandlers={{
                                                dragend: (e) => {
                                                    const marker = e.target;
                                                    const position = marker.getLatLng();
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        user_location: `${position.lat},${position.lng}`
                                                    }));
                                                },
                                            }}
                                            position={formData.user_location.split(',').map(Number)}
                                            icon={L.divIcon({
                                                className: 'custom-div-icon',
                                                html: `<div class="relative"><div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div><div class="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-2xl relative z-10"></div></div>`,
                                                iconSize: [24, 24],
                                                iconAnchor: [12, 12]
                                            })}
                                        />
                                        <MapCenterer coords={formData.user_location.split(',').map(Number)} />
                                        <MapEvents onLocationSelect={(lat, lng) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                user_location: `${lat},${lng}`
                                            }));
                                        }} />
                                    </MapContainer>
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                            <p className="text-xs font-bold text-gray-500">Mencari Lokasi...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Alamat Terdeteksi</p>
                                        <p className="text-xs font-bold text-gray-700 leading-relaxed">{formData.detected_address || 'Mencari alamat...'}</p>
                                        {formData.user_location && (
                                            <p className="text-[10px] font-bold text-gray-400 mt-1.5 font-mono">{formData.user_location.split(',').map(c => parseFloat(c).toFixed(6)).join(', ')}</p>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRefreshLocation}
                                        className="w-10 h-10 bg-white border border-blue-100 rounded-xl flex items-center justify-center shadow-sm hover:bg-blue-50 active:scale-90 transition-all text-blue-600"
                                        title="Refresh Lokasi"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Detail Tambahan (Opsional)</label>
                                    <textarea
                                        className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-orange-600 focus:bg-white rounded-[1.5rem] transition-all outline-none font-bold min-h-[80px] text-sm"
                                        value={formData.additional_details}
                                        onChange={(e) => setFormData({ ...formData, additional_details: e.target.value })}
                                        placeholder="No Rumah, Blok, atau patokan (seperti: Depan Indomaret, dsb)"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-200">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 leading-tight">Siap Meluncur?</h3>
                                <p className="text-gray-500 font-bold mt-2">Pastikan semua data sudah benar</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kendaraan</p>
                                    <p className="text-sm font-black text-gray-900 uppercase">{formData.vehicle_type} - {formData.vehicle_brand}</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Masalah</p>
                                    <p className="text-sm font-black text-gray-900 uppercase">{formData.problem_category}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-orange-600 rounded-[2rem] text-white shadow-2xl shadow-orange-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-1">Total Estimasi Layanan</p>
                                        <p className="text-2xl font-black">{getEstimate(formData.problem_category)}</p>
                                    </div>
                                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-black">BAYAR DI TEMPAT</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-bold">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex space-x-4">
                    {step > 1 && (
                        <button
                            onClick={prevStep}
                            className="flex-1 py-5 bg-white border-2 border-gray-200 text-gray-600 font-black rounded-[1.5rem] transition-all hover:bg-gray-100 active:scale-95 uppercase tracking-widest text-xs"
                        >
                            Kembali
                        </button>
                    )}
                    <button
                        disabled={loading || addressLoading || (step === 2 && !formData.vehicle_brand) || (step === 3 && !formData.problem_category) || ((step === 4 || step === 5) && (!formData.user_location || !formData.detected_address || formData.detected_address === 'Mengambil alamat...'))}
                        onClick={() => {
                            if (step === 5) {
                                handleSubmit();
                            } else {
                                if (step === 4 && (!formData.user_location || !formData.detected_address || formData.detected_address === 'Mengambil alamat...')) {
                                    setErrorMessage('Lokasi belum siap. Tunggu sampai alamat terdeteksi.');
                                    return;
                                }
                                if (step === 3) {
                                    // Pre-fetch location before entering Step 4
                                    handleRefreshLocation();
                                }
                                nextStep();
                            }
                        }}
                        className={`flex-[2] py-5 font-black rounded-[1.5rem] transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center space-x-3
                            ${loading || addressLoading || (step === 2 && !formData.vehicle_brand) || (step === 3 && !formData.problem_category) || ((step === 4 || step === 5) && (!formData.user_location || !formData.detected_address || formData.detected_address === 'Mengambil alamat...'))
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-orange-600 text-white shadow-2xl shadow-orange-200 hover:bg-orange-500'}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span>{step === 5 ? 'Konfirmasi Booking' : 'Selanjutnya'}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MapEvents = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
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

export default BookingModal;
