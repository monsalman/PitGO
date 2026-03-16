import React from 'react';

const Navbar = () => (
    <nav className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100">
        <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
                </svg>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">Pit<span className="text-orange-500 italic">GO</span></span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">Layanan</a>
            <a href="#" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">Cara Kerja</a>
            <a href="#" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">Darurat</a>
        </div>
        <div className="flex items-center space-x-6">
            <button className="text-sm font-bold text-gray-800 hover:text-orange-500 transition-colors">Masuk</button>
            <button className="px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-xl hover:bg-orange-500 hover:shadow-orange-200 transition-all active:scale-95">
                Daftar Sekarang
            </button>
        </div>
    </nav>
);

const Hero = () => (
    <div className="relative min-h-[calc(100vh-88px)] bg-gray-50 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50/50 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-8 py-16 lg:py-24 flex flex-col lg:flex-row items-center">
            {/* Content Left */}
            <div className="flex-1 z-10 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm mb-8">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-500 tracking-wide uppercase">Dipercaya oleh 50.000+ pemilik kendaraan</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-[900] text-gray-900 leading-[1.1] mb-8 tracking-tight">
                    Cari Mekanik <br />
                    <span className="text-orange-500 drop-shadow-sm italic">Kapan Saja, Di Mana Saja</span>
                </h1>

                <p className="text-lg lg:text-xl text-gray-500 font-medium mb-12 max-w-xl leading-relaxed">
                    Cara termudah untuk memesan servis kendaraan atau mendapatkan bantuan darurat di jalan dari profesional bersertifikat di dekat Anda.
                </p>

                {/* Location Search Box */}
                <div className="flex flex-col sm:flex-row items-center bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 max-w-2xl group transition-all focus-within:ring-4 focus-within:ring-orange-100">
                    <div className="flex-1 flex items-center px-4 py-3 space-x-3">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Masukkan lokasi Anda..."
                            className="bg-transparent border-none outline-none text-gray-800 font-semibold w-full placeholder:text-gray-400"
                        />
                    </div>
                    <button className="w-full sm:w-auto px-10 py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-300 hover:bg-orange-500 transition-all active:scale-95 leading-none">
                        Cari Terdekat
                    </button>
                </div>
            </div>

            {/* Hero Image Right */}
            <div className="flex-1 mt-16 lg:mt-0 relative w-full flex justify-center lg:justify-end">
                <div className="relative group">
                    {/* Shadow Decor */}
                    <div className="absolute -inset-4 bg-orange-500/20 rounded-[3rem] blur-2xl group-hover:bg-orange-500/30 transition-all duration-500"></div>

                    <div className="relative w-full max-w-[500px] h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group-hover:rotate-1 transition-all duration-500">
                        <img
                            src="/images/hero_mechanic.png"
                            alt="PitGO Mechanic"
                            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                    </div>

                    {/* Floating ETA Card - NOW INSIDE IMAGE AREA */}
                    <div className="absolute bottom-10 -left-10 lg:-left-16 flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 group-hover:translate-x-2 transition-transform duration-500">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center overflow-hidden">
                            <svg className="w-6 h-6 text-orange-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-lg font-black text-gray-900 leading-tight">Estimasi: 12 menit</div>
                            <div className="text-sm font-semibold text-gray-500 leading-tight">Mekanik sedang menuju lokasi</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const App = () => {
    return (
        <div className="min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
            <Navbar />
            <Hero />
        </div>
    );
};

export default App;
