import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapEvents = ({ onLocationSelect, reverseGeocode }) => {
    useMapEvents({
        async click(e) {
            const latlng = `${e.latlng.lat},${e.latlng.lng}`;
            onLocationSelect(latlng);
            if (reverseGeocode) {
                await reverseGeocode(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

const RecenterMap = ({ location }) => {
    const map = useMap();
    useEffect(() => {
        if (location) {
            const coords = location.split(',').map(Number);
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                map.setView(coords, 15, { animate: true });
            }
        }
    }, [location, map]);
    return null;
};

const Management = () => {
    const [users, setUsers] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'workshops'
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', role: 'user', password: '',
        address: '', location: '', photo: '', rating: 0, reviews_count: 0, is_open: true
    });
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const lookupAddress = async (address) => {
        if (!address || address.length < 5) return;
        setIsGeocoding(true);
        try {
            const response = await axios.get('/api/geocode', {
                params: {
                    q: address
                }
            });

            if (response.data && response.data.location) {
                setFormData(prev => ({ ...prev, location: response.data.location }));
            } else {
                alert('Alamat tidak ditemukan. Silakan rincikan alamat atau pilih langsung di peta.');
            }
        } catch (err) {
            console.error('Geocoding error', err);
            alert('Layanan pencarian lokasi sedang sibuk atau bermasalah. Silakan coba lagi atau pilih di peta.');
        } finally {
            setIsGeocoding(false);
        }
    };

    const reverseGeocode = async (lat, lon) => {
        setIsGeocoding(true);
        try {
            const response = await axios.get(`/api/reverse-geocode`, {
                params: {
                    lat: lat,
                    lon: lon
                }
            });
            if (response.data && response.data.display_name) {
                setFormData(prev => ({ ...prev, address: response.data.display_name }));
            }
        } catch (err) {
            console.error('Reverse geocoding error', err);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsGeocoding(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const locationStr = `${latitude},${longitude}`;
                setFormData(prev => ({ ...prev, location: locationStr }));
                await reverseGeocode(latitude, longitude);
            },
            (error) => {
                setIsGeocoding(false);
                console.error('Geolocation error', error);
                alert('Gagal mendapatkan lokasi. Pastikan izin lokasi sudah diaktifkan di browser Anda.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Link parsing + Debounced geocoding
    useEffect(() => {
        if (activeTab === 'workshops' && isModalOpen && !editingItem && formData.address) {
            // Check if it's a Google Maps URL
            if (formData.address.includes('google.com/maps')) {
                const urlMatch = formData.address.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (urlMatch) {
                    setFormData(prev => ({ ...prev, location: `${urlMatch[1]},${urlMatch[2]}` }));
                    return; // Skip geocoding if we got coordinates from URL
                }
            }

            const timer = setTimeout(() => {
                lookupAddress(formData.address);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [formData.address]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkshops = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/workshops');
            setWorkshops(response.data);
        } catch (err) {
            console.error('Failed to fetch workshops', err);
        } finally {
            setLoading(false);
        }
    };

    // Lock body scroll when any modal is open
    useEffect(() => {
        if (isModalOpen || isDeleteModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen, isDeleteModalOpen]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else {
            fetchWorkshops();
        }
    }, [activeTab]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            if (activeTab === 'users') {
                setFormData({ name: item.name, email: item.email, phone: item.phone || '', role: item.role, password: '' });
            } else {
                setFormData({
                    name: item.name,
                    address: item.address,
                    location: item.location || '',
                    photo: item.photo || '',
                    rating: item.rating,
                    reviews_count: item.reviews_count || 0,
                    is_open: item.is_open
                });
            }
        } else {
            setEditingItem(null);
            if (activeTab === 'users') {
                setFormData({ name: '', email: '', phone: '', role: 'user', password: '' });
            } else {
                setFormData({ name: '', address: '', location: '', photo: '', rating: 0, reviews_count: 0, is_open: true });
            }
        }
        setIsModalOpen(true);
    };

    const confirmDelete = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsSubmitting(true);
        try {
            const endpoint = activeTab === 'users' ? `/api/users/${itemToDelete.id}` : `/api/workshops/${itemToDelete.id}`;
            await axios.delete(endpoint);
            setIsDeleteModalOpen(false);
            activeTab === 'users' ? fetchUsers() : fetchWorkshops();
        } catch (err) {
            console.error('Delete error:', err);
            alert(err.response?.data?.message || `Gagal menghapus ${activeTab === 'users' ? 'user' : 'bengkel'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const endpoint = activeTab === 'users' ? '/api/users' : '/api/workshops';

            let dataToSend = formData;
            let config = {};

            if (activeTab === 'workshops') {
                const form = new FormData();
                Object.keys(formData).forEach(key => {
                    // Only append if it's not null/undefined
                    if (formData[key] !== null && formData[key] !== undefined) {
                        // Special handling for boolean values in FormData
                        if (key === 'is_open') {
                            form.append(key, formData[key] ? '1' : '0');
                        } else {
                            form.append(key, formData[key]);
                        }
                    }
                });

                // If editing, Laravel requires _method: PUT for multipart/form-data
                if (editingItem) {
                    form.append('_method', 'PUT');
                }

                dataToSend = form;
            }

            if (editingItem) {
                // If workshops, we must use POST with _method=PUT because of PHP/Laravel limitation with multipart PUT
                if (activeTab === 'workshops') {
                    await axios.post(`${endpoint}/${editingItem.id}`, dataToSend, config);
                } else {
                    await axios.put(`${endpoint}/${editingItem.id}`, dataToSend);
                }
            } else {
                await axios.post(endpoint, dataToSend, config);
            }
            setIsModalOpen(false);
            activeTab === 'users' ? fetchUsers() : fetchWorkshops();
        } catch (err) {
            console.error('Submit error:', err);
            alert(err.response?.data?.message || 'Gagal menyimpan data');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#f8fafc] overflow-x-hidden pt-44 pb-20">
            {/* Ultra-Vibrant Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[120px] -z-10 animate-[pulse_8s_infinite]"></div>
            <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-400/15 rounded-full blur-[100px] -z-10 animate-[bounce_10s_infinite]"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[450px] h-[450px] bg-purple-400/10 rounded-full blur-[120px] -z-10"></div>

            <div className="max-w-7xl mx-auto px-8 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 space-y-6 md:space-y-0">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-10 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)]"></div>
                                <h1 className="text-7xl font-black text-gray-900 tracking-tighter uppercase">System<span className="text-orange-600 italic">Control</span></h1>
                            </div>
                            <p className="text-gray-400 font-bold ml-5 uppercase tracking-[0.5em] text-[9px] opacity-60">Architectural Management Interface</p>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex items-center bg-white/30 backdrop-blur-xl p-1.5 rounded-2xl border border-white/50 w-fit ml-4 shadow-sm">
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'users' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                            >
                                User Registry
                            </button>
                            <button
                                onClick={() => setActiveTab('workshops')}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'workshops' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                            >
                                Workshop Hub
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => handleOpenModal()}
                        className="group relative px-10 py-5 bg-gray-900 text-white font-black rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex items-center space-x-4">
                            <div className="bg-white/10 p-2 rounded-xl">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="uppercase tracking-[0.15em] text-xs font-black">{activeTab === 'users' ? 'Register User' : 'Add Workshop'}</span>
                        </div>
                    </button>
                </div>

                {/* Enhanced Glassmorphism Card */}
                <div className="relative group/card">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/30 to-blue-500/30 rounded-[2.5rem] blur opacity-40 group-hover/card:opacity-60 transition duration-1000"></div>
                    <div className="relative bg-white/20 backdrop-blur-[55px] rounded-[2rem] border border-white/60 shadow-[0_40px_100px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/30 border-b border-white/40">
                                        {activeTab === 'users' ? (
                                            <>
                                                <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Identitas Master</th>
                                                <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Data Hub</th>
                                                <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Role</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Store Identity</th>
                                                <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Location Info</th>
                                                <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Status</th>
                                            </>
                                        )}
                                        <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] text-right">Opsi Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/40">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="px-12 py-44 text-center">
                                                <div className="relative inline-block w-20 h-20">
                                                    <div className="absolute inset-0 border-8 border-orange-500/10 rounded-full"></div>
                                                    <div className="absolute inset-0 border-8 border-orange-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(249,115,22,0.2)]"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : activeTab === 'users' && users.length > 0 ? (
                                        users.map((u) => (
                                            <tr key={u.id} className="hover:bg-white/50 transition-all duration-500 group/row">
                                                <td className="px-12 py-10">
                                                    <div className="flex items-center space-x-7">
                                                        <div className="relative">
                                                            <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-orange-400 rounded-2xl blur opacity-0 group-hover/row:opacity-20 transition duration-500"></div>
                                                            <div className="relative w-16 h-16 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl flex items-center justify-center font-black text-gray-300 group-hover/row:text-orange-600 transition-all duration-500 uppercase text-2xl border border-white">
                                                                {u.name.charAt(0)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-gray-900 text-2xl leading-tight tracking-tighter group-hover/row:translate-x-1 transition-transform duration-500">{u.name}</div>
                                                            <div className="text-gray-400 font-bold text-[10px] tracking-[0.2em] mt-2 group-hover/row:text-gray-900 transition-colors duration-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <div className="font-black text-gray-700 tracking-[-0.05em] text-xl opacity-80 group-hover/row:opacity-100 transition-opacity">
                                                        {u.phone || '—'}
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <div className={`inline-flex px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-500 shadow-sm border ${u.role === 'admin'
                                                        ? 'bg-gray-900 text-white border-gray-800 shadow-[0_10px_20px_rgba(0,0,0,0.1)] ring-4 ring-gray-900/5'
                                                        : 'bg-white/80 text-gray-400 border-white group-hover/row:border-blue-200'
                                                        }`}>
                                                        <span className="flex items-center">
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-2.5 ${u.role === 'admin' ? 'bg-orange-500 animate-pulse' : 'bg-blue-400'}`}></span>
                                                            {u.role}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10 text-right">
                                                    <div className="flex justify-end space-x-4">
                                                        <button
                                                            onClick={() => handleOpenModal(u)}
                                                            className="w-14 h-14 flex items-center justify-center bg-white/60 backdrop-blur-md text-blue-500 rounded-full border border-white shadow-sm hover:bg-blue-600 hover:text-white hover:-translate-y-1.5 hover:shadow-xl hover:scale-110 transition-all duration-500 active:scale-90"
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(u)}
                                                            className="w-14 h-14 flex items-center justify-center bg-white/60 backdrop-blur-md text-red-500 rounded-full border border-white shadow-sm hover:bg-red-600 hover:text-white hover:-translate-y-1.5 hover:shadow-xl hover:scale-110 transition-all duration-500 active:scale-90"
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : activeTab === 'workshops' && workshops.length > 0 ? (
                                        workshops.map((w) => (
                                            <tr key={w.id} className="hover:bg-white/50 transition-all duration-500 group/row">
                                                <td className="px-12 py-10">
                                                    <div className="flex items-center space-x-7">
                                                        <div className="relative">
                                                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl blur opacity-0 group-hover/row:opacity-20 transition duration-500"></div>
                                                            <div className="relative w-20 h-20 bg-white shadow-lg rounded-2xl overflow-hidden border border-white">
                                                                {w.photo ? (
                                                                    <img src={w.photo} alt={w.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center font-black text-gray-200 text-3xl">
                                                                        {w.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-gray-900 text-2xl leading-tight tracking-tighter group-hover/row:translate-x-1 transition-transform duration-500">{w.name}</div>
                                                            <div className="flex items-center mt-2 space-x-3">
                                                                <span className="text-orange-500 text-sm font-black flex items-center">
                                                                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                                    {w.rating || '5.0'}
                                                                </span>
                                                                <span className="text-gray-400 font-bold text-xs opacity-60">({w.reviews_count || 0})</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <div className="space-y-3">
                                                        <div className="max-w-[200px]">
                                                            <div className="text-gray-400 font-bold text-[10px] tracking-[0.1em] uppercase mb-1">Address</div>
                                                            <div className="text-gray-900 font-black text-xs leading-relaxed line-clamp-2 uppercase">
                                                                {w.address}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Coordinate</div>
                                                            <div className="font-black text-gray-700 tracking-[-0.05em] text-sm opacity-80">
                                                                {w.location || 'Pending Geocode'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <div className={`inline-flex px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-500 shadow-sm border ${w.is_open
                                                        ? 'bg-green-500 text-white border-green-400 shadow-[0_10px_20px_rgba(34,197,94,0.1)]'
                                                        : 'bg-red-500 text-white border-red-400 shadow-[0_10px_20px_rgba(239,68,68,0.1)]'
                                                        }`}>
                                                        <span className="flex items-center">
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-2.5 bg-white animate-pulse`}></span>
                                                            {w.is_open ? 'Open' : 'Closed'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10 text-right">
                                                    <div className="flex justify-end space-x-4">
                                                        <button
                                                            onClick={() => handleOpenModal(w)}
                                                            className="w-14 h-14 flex items-center justify-center bg-white/60 backdrop-blur-md text-blue-500 rounded-full border border-white shadow-sm hover:bg-blue-600 hover:text-white hover:-translate-y-1.5 hover:shadow-xl hover:scale-110 transition-all duration-500 active:scale-90"
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(w)}
                                                            className="w-14 h-14 flex items-center justify-center bg-white/60 backdrop-blur-md text-red-500 rounded-full border border-white shadow-sm hover:bg-red-600 hover:text-white hover:-translate-y-1.5 hover:shadow-xl hover:scale-110 transition-all duration-500 active:scale-90"
                                                        >
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-12 py-24 text-center">
                                                <div className="flex flex-col items-center space-y-4 opacity-30">
                                                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                    <span className="font-black uppercase tracking-[0.5em] text-[10px]">Registry Zero State</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div
                    onClick={(e) => e.target === e.currentTarget && setIsDeleteModalOpen(false)}
                    className="fixed inset-0 z-[150] flex items-start justify-center p-6 pt-32 backdrop-blur-[25px] bg-black/50 animate-in fade-in duration-500 overflow-y-auto cursor-pointer"
                >
                    <div className="bg-white/30 backdrop-blur-[60px] rounded-[2.5rem] w-full max-w-lg p-14 shadow-[0_80px_150px_rgba(0,0,0,0.3)] border border-white/60 relative scale-in-center overflow-hidden cursor-default">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>

                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute top-10 right-10 text-gray-400 hover:text-gray-900 transition-all duration-300 z-50 bg-white/20 p-2.5 rounded-xl hover:bg-white hover:rotate-90 shadow-sm"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-[0_20px_40px_rgba(239,68,68,0.1)] group-hover:rotate-12 transition-transform border border-red-100">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-tight mb-4">Confirm Deletion</h2>
                            <p className="text-gray-900 font-bold mb-12 text-lg">Apakah Anda yakin ingin menghapus <span className="text-red-600 uppercase font-black px-1.5">{itemToDelete?.name}</span>? Tindakan ini bersifat permanen.</p>

                            <div className="flex flex-col space-y-4">
                                <button
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className={`w-full py-6 text-white font-black rounded-2xl shadow-[0_20px_40px_rgba(220,38,38,0.2)] transition-all flex items-center justify-center space-x-3 text-xs uppercase tracking-[0.3em] ${isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:-translate-y-1 active:scale-95'}`}
                                >
                                    {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    <span>{isSubmitting ? 'Destroying...' : 'Confirm & Destroy'}</span>
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="w-full py-6 bg-white/50 text-gray-500 font-black rounded-2xl border border-white hover:text-gray-900 transition-all text-xs uppercase tracking-[0.3em] disabled:opacity-50"
                                >
                                    Abort Action
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Registry Modal Upgrade */}
            {isModalOpen && (
                <div
                    onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                    className="fixed inset-0 z-[150] flex items-start justify-center p-6 pt-32 backdrop-blur-[30px] bg-black/50 animate-in fade-in duration-500 overflow-y-auto cursor-pointer"
                >
                    <div className="bg-white/30 backdrop-blur-[70px] rounded-[2.5rem] w-full max-w-xl p-12 shadow-[0_100px_200px_rgba(0,0,0,0.3)] border border-white/60 relative overflow-hidden group/modal cursor-default">
                        <div className="absolute top-0 right-0 w-56 h-56 bg-orange-500/10 rounded-full -mr-28 -mt-28 blur-[90px] group-hover/modal:bg-orange-500/15 transition-all duration-1000 pointer-events-none"></div>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-14 right-14 text-gray-400 hover:text-gray-900 transition-all duration-300 z-50 bg-white/20 p-3 rounded-2xl hover:bg-white hover:rotate-90 shadow-sm border border-white/50"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="mb-14 relative z-10">
                            <div className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                                {activeTab === 'users' ? 'Registry Configuration' : 'Store Parameters'}
                            </div>
                            <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2">
                                {activeTab === 'users' ? (editingItem ? 'Profile Edit' : 'User Registry') : (editingItem ? 'Update Store' : 'New Workshop')}
                            </h2>
                            <p className="text-gray-400 font-bold text-xs tracking-[0.2em] uppercase opacity-70">Initialize {activeTab === 'users' ? 'System Authority' : 'Store Property'} Parameters</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">{activeTab === 'users' ? 'Full Legal Identity' : 'Commercial Name'}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-10 py-6 bg-white/10 border border-white/40 rounded-2xl focus:ring-[15px] focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all duration-500 font-black text-gray-900 tracking-tighter text-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"
                                    value={formData.name}
                                    placeholder={activeTab === 'users' ? "Nomenclature" : "Workshop Name"}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {activeTab === 'users' ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Digital Mail</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-10 py-6 bg-white/50 border border-white/80 rounded-2xl focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all duration-500 font-black text-gray-700 shadow-sm"
                                                value={formData.email}
                                                placeholder="admin@pitgo.nexus"
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Phone</label>
                                            <input
                                                type="text"
                                                className="w-full px-10 py-6 bg-white/50 border border-white/80 rounded-2xl focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all duration-500 font-black text-gray-700 shadow-sm"
                                                value={formData.phone}
                                                placeholder="+62 000 0000"
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Authority Level Assignment</label>
                                        <div className="relative group/select">
                                            <select
                                                className="w-full px-10 py-6 bg-white/50 border border-white/80 rounded-2xl focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all duration-500 font-black uppercase text-[11px] tracking-[0.3em] appearance-none cursor-pointer shadow-sm pr-20"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                            <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover/select:text-orange-500 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    {!editingItem && (
                                        <div className="space-y-3">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Access Key (Password)</label>
                                            <input
                                                type="password"
                                                required={!editingItem}
                                                className="w-full px-10 py-6 bg-white/50 border border-white/80 rounded-2xl focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all duration-500 font-black text-gray-900 shadow-sm"
                                                value={formData.password}
                                                placeholder="••••••••"
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Physical Address</label>
                                        <div className="relative group/address">
                                            <textarea
                                                required
                                                className="w-full px-10 py-6 bg-white/50 border border-white/80 rounded-2xl focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all duration-500 font-black text-gray-700 shadow-sm min-h-[120px] transition-all"
                                                value={formData.address}
                                                placeholder="Full Street Address"
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                            {isGeocoding && (
                                                <div className="absolute top-4 right-4 flex items-center space-x-2 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 animate-pulse">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
                                                    <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest">Searching...</span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => lookupAddress(formData.address)}
                                                className="absolute bottom-4 right-4 w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all active:scale-90 border border-white"
                                                title="Manual Lookup"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Geographic Coordinates</label>
                                            <div className="flex space-x-2 mr-2 mb-1">
                                                <button
                                                    type="button"
                                                    onClick={handleGetCurrentLocation}
                                                    className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center space-x-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    <span>My Location</span>
                                                </button>
                                                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded-md border border-orange-100">Click Map to Pick Location</span>
                                            </div>
                                        </div>
                                        <div className="relative group/map">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-[1.5rem] blur opacity-30 group-hover/map:opacity-50 transition duration-500"></div>
                                            <div className="relative h-[250px] w-full rounded-2xl overflow-hidden border border-white/60 shadow-lg z-0">
                                                <MapContainer
                                                    center={(() => {
                                                        if (formData.location) {
                                                            const coords = formData.location.split(',').map(Number);
                                                            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) return coords;
                                                        }
                                                        return [-6.2088, 106.8456];
                                                    })()}
                                                    zoom={13}
                                                    style={{ height: '100%', width: '100%' }}
                                                >
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                    <MapEvents
                                                        onLocationSelect={(loc) => setFormData(prev => ({ ...prev, location: loc }))}
                                                        reverseGeocode={reverseGeocode}
                                                    />
                                                    <RecenterMap location={formData.location} />
                                                    {(() => {
                                                        if (formData.location) {
                                                            const coords = formData.location.split(',').map(Number);
                                                            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                                                                return <Marker position={coords} />;
                                                            }
                                                        }
                                                        return null;
                                                    })()}
                                                </MapContainer>

                                                {/* Floating Coordinate Display - Premium Glassmorphism */}
                                                <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
                                                    <div className="relative group/coords overflow-hidden rounded-2xl">
                                                        {/* Glass background */}
                                                        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"></div>

                                                        <div className="relative px-5 py-4 flex items-center justify-between pointer-events-auto">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                                                        <span className="text-[7px] font-black text-gray-500/80 uppercase tracking-[0.3em] leading-none">GPS Fix</span>
                                                                    </div>
                                                                    <div className="text-[12px] font-black text-gray-800 tracking-tighter family-mono flex items-baseline">
                                                                        <span className="opacity-40 text-[9px] mr-1 uppercase">LOC:</span>
                                                                        {formData.location || 'WAITING FOR DATA...'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(formData.location);
                                                                        const btn = document.getElementById('copy-indicator');
                                                                        btn.innerText = 'COPIED!';
                                                                        setTimeout(() => btn.innerText = 'COPY', 2000);
                                                                    }}
                                                                    className="px-4 py-2 bg-white/60 hover:bg-orange-500 hover:text-white rounded-xl transition-all duration-300 border border-white/80 group/btn flex items-center space-x-2 shadow-sm pointer-events-auto active:scale-95"
                                                                >
                                                                    <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                                    <span id="copy-indicator" className="text-[8px] font-black uppercase tracking-widest">Copy</span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Decorative gradient line */}
                                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 opacity-30"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Operational Status</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_open: !formData.is_open })}
                                            className={`w-full py-6 rounded-2xl border transition-all duration-500 font-black uppercase text-[10px] tracking-[0.2em] shadow-sm flex items-center justify-center space-x-3 ${formData.is_open ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${formData.is_open ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                            <span>{formData.is_open ? 'Bengkel Buka' : 'Bengkel Tutup'}</span>
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Workshop Photo</label>
                                        <div className="relative group/photo">
                                            <div className="flex flex-col items-center justify-center w-full px-10 py-10 bg-white/50 border-2 border-dashed border-white/80 rounded-[2rem] hover:border-orange-500/50 transition-all duration-500 group/dropzone overflow-hidden">
                                                {formData.photo && typeof formData.photo === 'string' ? (
                                                    <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 shadow-lg group-hover/dropzone:scale-105 transition-transform duration-700">
                                                        <img src={formData.photo} alt="Workshop" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/dropzone:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white font-black text-[8px] uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">Change Image</span>
                                                        </div>
                                                    </div>
                                                ) : formData.photo instanceof File ? (
                                                    <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 shadow-lg group-hover/dropzone:scale-105 transition-transform duration-700">
                                                        <img src={URL.createObjectURL(formData.photo)} alt="Workshop" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/dropzone:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white font-black text-[8px] uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">Replace File</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center py-4 space-y-4">
                                                        <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center border border-orange-500/20 group-hover/dropzone:scale-110 group-hover/dropzone:rotate-12 transition-all">
                                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Upload Workshop Visual</p>
                                                            <p className="text-[8px] font-bold text-gray-400">JPG, PNG or WEBP (MAX 2MB)</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) setFormData({ ...formData, photo: file });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                disabled={isSubmitting}
                                className={`group relative w-full py-7 font-black rounded-[2rem] overflow-hidden transition-all mt-10 ${isSubmitting ? 'bg-gray-800 cursor-not-allowed opacity-80' : 'bg-gray-900 hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] hover:-translate-y-1 active:scale-[0.98] text-white'}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity ${isSubmitting ? 'hidden' : ''}`}></div>
                                <div className="relative z-10 flex items-center justify-center space-x-4">
                                    {isSubmitting && (
                                        <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span className="uppercase tracking-[0.4em] text-[10px]">
                                        {isSubmitting ? 'Processing Engine...' : 'Execute Configuration Save'}
                                    </span>
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Management;

