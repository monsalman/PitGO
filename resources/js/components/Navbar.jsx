import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const linksRef = useRef({});

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Update sliding pill position when route or user (for role-based links) changes
    useEffect(() => {
        const activePath = location.pathname;
        const activeElement = linksRef.current[activePath];
        
        if (activeElement) {
            setPillStyle({
                left: activeElement.offsetLeft,
                width: activeElement.offsetWidth,
                opacity: 1
            });
        } else {
            setPillStyle(prev => ({ ...prev, opacity: 0 }));
        }
    }, [location.pathname, user]);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl flex items-center justify-between px-8 py-3 rounded-2xl transition-all duration-500 border ${
            scrolled 
            ? 'bg-black/60 backdrop-blur-3xl border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2.5' 
            : 'bg-white/20 backdrop-blur-2xl border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.07)] shadow-white/20'
        }`}>
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-6 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                    </svg>
                </div>
                <span className={`text-2xl font-black tracking-tight transition-colors duration-500 ${scrolled ? 'text-white' : 'text-gray-900'}`}>
                    Pit<span className="text-orange-500 italic">GO</span>
                </span>
            </div>

            <div className="hidden md:flex items-center relative bg-white/5 backdrop-blur-sm p-1 rounded-full border border-white/5 space-x-1">
                {/* Sliding Pill Background */}
                <div 
                    className="absolute h-[calc(100%-8px)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{
                        left: pillStyle.left,
                        width: pillStyle.width,
                        opacity: pillStyle.opacity,
                        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(17,24,39,1)',
                        boxShadow: scrolled ? '0 10px 25px -5px rgba(0,0,0,0.1)' : '0 10px 20px -5px rgba(0,0,0,0.2)'
                    }}
                />
                
                <a 
                    ref={el => linksRef.current['/'] = el}
                    href="#" 
                    onClick={(e) => { e.preventDefault(); navigate('/'); }} 
                    className={`relative z-10 text-xs font-black px-6 py-2 rounded-full transition-colors duration-500 ${
                        isActive('/') 
                        ? (scrolled ? 'text-orange-600' : 'text-white') 
                        : (scrolled ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                    }`}
                >
                    Beranda
                </a>
                
                <a 
                    ref={el => linksRef.current['/how-it-works'] = el}
                    href="#" 
                    onClick={(e) => { e.preventDefault(); }} 
                    className={`relative z-10 text-xs font-black px-6 py-2 rounded-full transition-colors duration-500 ${
                        isActive('/how-it-works') 
                        ? (scrolled ? 'text-orange-600' : 'text-white') 
                        : (scrolled ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                    }`}
                >
                    Cara Kerja
                </a>

                {user?.role === 'admin' && (
                    <a 
                        ref={el => linksRef.current['/management'] = el}
                        href="#" 
                        onClick={(e) => { e.preventDefault(); navigate('/management'); }} 
                        className={`relative z-10 text-xs font-black px-6 py-2 rounded-full transition-colors duration-500 ${
                            isActive('/management') 
                            ? (scrolled ? 'text-orange-600' : 'text-white') 
                            : (scrolled ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                        }`}
                    >
                        Management
                    </a>
                )}

                {(user?.role === 'workshop' || user?.role === 'mechanic') && (
                    <a 
                        ref={el => linksRef.current['/workshop/dashboard'] = el}
                        href="#" 
                        onClick={(e) => { e.preventDefault(); navigate('/workshop/dashboard'); }} 
                        className={`relative z-10 text-xs font-black px-6 py-2 rounded-full transition-colors duration-500 ${
                            isActive('/workshop/dashboard') 
                            ? (scrolled ? 'text-orange-600' : 'text-white') 
                            : (scrolled ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                        }`}
                    >
                        Workshop
                    </a>
                )}
            </div>

            <div className="flex items-center space-x-4">
                {user ? (
                    <div className={`flex items-center space-x-3 p-1.5 rounded-xl transition-all duration-500 ${
                        scrolled ? 'bg-white/10 border border-white/10' : 'bg-gray-100/50 border border-gray-200/50'
                    }`}>
                        <div className={`px-4 py-1.5 hidden lg:block border-r transition-colors duration-500 ${scrolled ? 'border-white/10' : 'border-gray-200'}`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest block leading-none mb-1 ${scrolled ? 'text-white/50' : 'text-gray-400'}`}>
                                {user.role === 'admin' ? 'Admin Panel' : (user.role === 'mechanic' ? 'Mechanic Panel' : 'Workshop Panel')}
                            </span>
                            <span className={`text-sm font-black transition-colors duration-500 ${scrolled ? 'text-white' : 'text-gray-900'}`}>{user.name}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-sm border ${
                                scrolled ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigate('/login')}
                            className={`text-sm font-black px-6 py-2.5 rounded-lg transition-all duration-500 ${scrolled ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            Masuk
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-6 py-2.5 bg-orange-600 text-white text-sm font-black rounded-lg shadow-xl hover:bg-orange-500 hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            Daftar
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
