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
        <div className="min-h-screen bg-[#e5e7eb] relative flex items-center justify-center p-4 lg:p-8 font-sans overflow-hidden">
            {/* Ultra-prominent Background Blobs for Glass Effect */}
            <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[140px] animate-blob-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-orange-500/25 rounded-full blur-[140px] animate-blob-slow delay-1000"></div>
            <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-purple-500/15 rounded-full blur-[120px] animate-blob-slow delay-2000"></div>
            
            <div className="w-full max-w-5xl relative z-10 animate-fade-slide-up">
                {/* Advanced Glassmorphism Card */}
                <div className="bg-white/10 backdrop-blur-[40px] rounded-[3rem] border border-white/40 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col lg:flex-row-reverse ring-1 ring-white/20">
                    
                    {/* Hero Info - Right Section */}
                    <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-l border-white/20 bg-white/5 animate-fade-in delay-300">
                        <div className="flex items-center space-x-3 mb-8 cursor-pointer group" onClick={onBackToHome}>
                            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20 group-hover:rotate-6 transition-transform">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                                </svg>
                            </div>
                            <span className="text-3xl font-black text-gray-900 tracking-tighter">Pit<span className="text-orange-600 italic italic-glow">GO</span></span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                            Bergabung <span className="text-orange-600">Sekarang!</span>
                        </h1>
                        <p className="text-gray-600 font-bold text-base lg:text-lg leading-relaxed mb-10">
                            Nikmati fasilitas lengkap untuk perawatan kendaraan Anda dalam satu aplikasi.
                        </p>

                        <div className="hidden lg:grid grid-cols-1 gap-4">
                            {[
                                { color: 'green', label: 'Proses Cepat & Mudah' },
                                { color: 'blue', label: 'Akses 500+ Bengkel' },
                                { color: 'orange', label: 'Eksklusif Promo Partner' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center space-x-4 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/30 shadow-sm transition-all hover:translate-x-2 hover:bg-white/20">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-${item.color}-500/20`}>
                                        <svg className={`w-5 h-5 text-${item.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="font-black text-gray-800 tracking-tight">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Left Section - Form */}
                    <div className="flex-1 p-8 lg:p-14 flex flex-col justify-center bg-white/5 animate-fade-in delay-500 overflow-y-auto max-h-[85vh] lg:max-h-none">
                        <div className="mb-6">
                            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-1">Daftar Akun</h2>
                            <p className="text-gray-500 font-black text-xs uppercase tracking-[.2em] opacity-80">Lengkapi profil Anda</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-500/10 backdrop-blur-md text-red-600 rounded-2xl border border-red-500/20 font-black text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nama Anda"
                                        className="w-full px-5 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-gray-900 placeholder:text-gray-400 shadow-inner"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="nama@email.com"
                                        className="w-full px-5 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-gray-900 placeholder:text-gray-400 shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">WhatsApp</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full px-5 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-gray-900 placeholder:text-gray-400 shadow-inner"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-gray-900 placeholder:text-gray-400 shadow-inner"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-2">Konfirmasi</label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3 bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-gray-900 placeholder:text-gray-400 shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-orange-600 text-white font-black text-lg rounded-2xl shadow-2xl shadow-orange-600/30 hover:bg-orange-500 hover:shadow-orange-600/50 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center space-x-3 group"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>Daftar Sekarang</span>
                                            <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center border-t border-white/10 pt-6">
                            <p className="text-gray-500 text-sm font-bold">
                                Sudah punya akun? <button onClick={onLoginClick} className="text-orange-600 font-black hover:underline ml-1">Masuk</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .italic-glow { filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.4)); }
                @keyframes blob-slow {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-30px, 50px) scale(1.1); }
                    66% { transform: translate(20px, -20px) scale(0.9); }
                }
                .animate-blob-slow { animation: blob-slow 10s infinite alternate cubic-bezier(0.45, 0, 0.55, 1); }
                
                @keyframes fade-slide-up {
                    0% { opacity: 0; transform: translateY(30px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-slide-up { animation: fade-slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                
                @keyframes fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .animate-fade-in { opacity: 0; animation: fade-in 1s ease-out forwards; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-500 { animation-delay: 0.5s; }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
            `}} />
        </div>
    );
};

export default Register;
