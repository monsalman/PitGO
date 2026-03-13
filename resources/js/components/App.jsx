import React from 'react';

const App = () => {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
                        Pit<span className="text-blue-600 italic font-black">GO</span>
                    </h1>
                    <p className="text-slate-500 font-medium mb-8">
                        React + Laravel + PostgreSQL
                    </p>
                    <div className="w-full space-y-3">
                        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm text-slate-600 font-semibold">PostgreSQL Connected</span>
                        </div>
                        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
                            <span className="text-sm text-slate-600 font-semibold">React Frontend Active</span>
                        </div>
                    </div>
                    <button className="mt-10 w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-blue-200 hover:shadow-indigo-300 transition-all active:scale-95">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
