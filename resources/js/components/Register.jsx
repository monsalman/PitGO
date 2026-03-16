import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onRegisterSuccess, onBackToHome, onLoginClick }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/register', formData);
            onRegisterSuccess(response.data.user);
        } catch (err) {
            if (err.response?.status === 422) {
                const errors = err.response.data.errors;
                setError(Object.values(errors).flat()[0]);
            } else {
                setError('Pendaftaran gagal. Silakan coba lagi nanti.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 lg:p-12 font-sans">
            <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                
                {/* Left Side Content */}
                <div className="flex-1 max-w-xl text-left">
                    <div className="flex items-center space-x-3 mb-10 cursor-pointer group" onClick={onBackToHome}>
                        <div className="w-14 h-14 bg-[#FF5100] rounded-2xl flex items-center justify-center shadow-xl shadow-orange-100 group-hover:scale-105 transition-transform duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                            </svg>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-3xl font-black text-gray-900 tracking-tight">Pit<span className="text-[#FF5100]">GO</span></span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Vehicle Repair Platform</span>
                        </div>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">Bergabung Sekarang!</h1>
                    <p className="text-gray-500 font-bold text-lg mb-12 leading-relaxed">
                        Daftarkan diri Anda untuk menikmati kemudahan dalam merawat dan memperbaiki kendaraan Anda.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-[#E7F9ED] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-black text-lg leading-tight">Proses Cepat</h3>
                                <p className="text-gray-400 font-bold text-sm mt-1">Daftar hanya dalam hitungan detik</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-[#E8F1FF] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-black text-lg leading-tight">Banyak Bengkel</h3>
                                <p className="text-gray-400 font-bold text-sm mt-1">Akses ke jaringan bengkel bersertifikat</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Card */}
                <div className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-[0_25px_80px_-20px_rgba(0,0,0,0.1)] p-10 lg:p-14">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Daftar Akun</h2>
                        <p className="text-gray-400 font-bold text-sm">Lengkapi data di bawah untuk mendaftar</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 ml-1">Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Masukkan nama Anda"
                                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#FF5100] focus:ring-[3px] focus:ring-orange-50 transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 ml-1">Alamat Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#FF5100] focus:ring-[3px] focus:ring-orange-50 transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 ml-1">Nomor WhatsApp</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="08xxxxxxxxxx"
                                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#FF5100] focus:ring-[3px] focus:ring-orange-50 transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Buat password minimal 8 karakter"
                                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#FF5100] focus:ring-[3px] focus:ring-orange-50 transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2 ml-1">Konfirmasi Password</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                placeholder="Ulangi password Anda"
                                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#FF5100] focus:ring-[3px] focus:ring-orange-50 transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-[#FF5100] text-white font-[950] text-lg rounded-2xl shadow-xl shadow-orange-100 hover:bg-[#FF4000] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center space-x-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Mulai Sekarang</span>
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-gray-400 font-bold text-sm">
                            Sudah punya akun? <button onClick={onLoginClick} className="text-[#FF5100] font-black hover:underline ml-1">Masuk</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
