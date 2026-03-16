import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess, onBackToHome }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/login', {
                email,
                password,
                remember
            });
            onLoginSuccess(response.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Silakan cek kembali email dan password Anda.');
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

                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">Welcome Back!</h1>
                    <p className="text-gray-500 font-bold text-lg mb-12 leading-relaxed">
                        Sign in to access your dashboard and manage your vehicle repair services efficiently.
                    </p>

                    <div className="space-y-8">
                        {/* 24/7 Support */}
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-[#E7F9ED] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-black text-lg leading-tight">24/7 Emergency Support</h3>
                                <p className="text-gray-400 font-bold text-sm mt-1">Get roadside assistance anytime, anywhere</p>
                            </div>
                        </div>

                        {/* Trusted Workshops */}
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-[#E8F1FF] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-black text-lg leading-tight">Trusted Workshops</h3>
                                <p className="text-gray-400 font-bold text-sm mt-1">Connect with certified mechanics near you</p>
                            </div>
                        </div>

                        {/* Real-time Tracking */}
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-[#FFF4E4] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                <svg className="w-5 h-5 text-[#FF9533]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-black text-lg leading-tight">Real-time Tracking</h3>
                                <p className="text-gray-400 font-bold text-sm mt-1">Monitor your service status in real-time</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Card */}
                <div className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-[0_25px_80px_-20px_rgba(0,0,0,0.1)] p-10 lg:p-14">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Sign In</h2>
                        <p className="text-gray-400 font-bold text-sm">Enter your credentials to continue</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-7">
                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2.5 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF5100] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:border-[#FF5100] focus:ring-[3px] focus:ring-orange-50 transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-black text-gray-700 mb-2.5 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#FF5100] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:border-[#FF5100] focus:ring-[3px] focus:ring-orange-50 transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#FF5100] focus:ring-[#FF5100] transition-all cursor-pointer" 
                                />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-black text-[#FF5100] hover:text-[#FF4000] transition-colors">Forgot Password?</a>
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
                                    <span>Sign In</span>
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-14 text-center">
                        <p className="text-gray-400 font-bold text-sm">
                            Don't have an account? <a href="#" className="text-[#FF5100] font-black hover:underline ml-1">Sign Up</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
