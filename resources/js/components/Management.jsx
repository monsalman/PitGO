import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Management = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'user', password: '' });

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
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
        fetchUsers();
    }, []);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, password: '' });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', phone: '', role: 'user', password: '' });
        }
        setIsModalOpen(true);
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await axios.delete(`/api/users/${userToDelete.id}`);
            setIsDeleteModalOpen(false);
            fetchUsers();
        } catch (err) {
            alert('Gagal menghapus user');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await axios.put(`/api/users/${editingUser.id}`, formData);
            } else {
                await axios.post('/api/users', formData);
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan data');
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
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-10 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)]"></div>
                            <h1 className="text-7xl font-black text-gray-900 tracking-tighter">System<span className="text-orange-600 italic">Control</span></h1>
                        </div>
                        <p className="text-gray-400 font-bold ml-5 uppercase tracking-[0.5em] text-[9px] opacity-60">Architectural Management Interface</p>
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
                            <span className="uppercase tracking-[0.15em] text-xs font-black">Register User</span>
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
                                        <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Identitas Master</th>
                                        <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Data Hub</th>
                                        <th className="px-12 py-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Role</th>
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
                                    ) : users.length > 0 ? (
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
                                                            : u.role === 'workshop'
                                                                ? 'bg-orange-500 text-white border-orange-400 shadow-[0_10px_20px_rgba(249,115,22,0.1)]'
                                                                : 'bg-white/80 text-gray-400 border-white group-hover/row:border-blue-200'
                                                        }`}>
                                                        <span className="flex items-center">
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-2.5 ${u.role === 'admin' ? 'bg-orange-500 animate-pulse' :
                                                                    u.role === 'workshop' ? 'bg-white animate-bounce' :
                                                                        'bg-blue-400'
                                                                }`}></span>
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
                            <p className="text-gray-500 font-bold mb-12">Apakah Anda yakin ingin menghapus akses <span className="text-red-600 uppercase tracking-tight">{userToDelete?.name}</span>? Tindakan ini bersifat permanen.</p>

                            <div className="flex flex-col space-y-4">
                                <button
                                    onClick={handleDelete}
                                    className="w-full py-6 bg-red-600 text-white font-black rounded-2xl shadow-[0_20px_40px_rgba(220,38,38,0.2)] hover:bg-red-700 hover:-translate-y-1 transition-all active:scale-95 text-xs uppercase tracking-[0.3em]"
                                >
                                    Confirm & Destroy
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="w-full py-6 bg-white/50 text-gray-400 font-black rounded-2xl border border-white hover:text-gray-900 transition-all text-xs uppercase tracking-[0.3em]"
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
                    <div className="bg-white/30 backdrop-blur-[70px] rounded-[2.5rem] w-full max-w-2xl p-16 shadow-[0_100px_200px_rgba(0,0,0,0.3)] border border-white/60 relative overflow-hidden group/modal cursor-default">
                        <div className="absolute top-0 right-0 w-56 h-56 bg-orange-500/10 rounded-full -mr-28 -mt-28 blur-[90px] group-hover/modal:bg-orange-500/15 transition-all duration-1000 pointer-events-none"></div>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-14 right-14 text-gray-400 hover:text-gray-900 transition-all duration-300 z-50 bg-white/20 p-3 rounded-2xl hover:bg-white hover:rotate-90 shadow-sm border border-white/50"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="mb-14 relative z-10">
                            <div className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                                Registry Configuration
                            </div>
                            <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-2">
                                {editingUser ? 'Profile Edit' : 'User Registry'}
                            </h2>
                            <p className="text-gray-400 font-bold text-xs tracking-[0.2em] uppercase opacity-70">Initialize System Authority Parameters</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="space-y-3">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Full Legal Identity</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-10 py-6 bg-white/10 border border-white/40 rounded-2xl focus:ring-[15px] focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all duration-500 font-black text-gray-900 tracking-tighter text-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"
                                    value={formData.name}
                                    placeholder="Nomenclature"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
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
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Encryption Link (Phone)</label>
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
                                        <option value="workshop">Workshop</option>
                                    </select>
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-hover/select:text-orange-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            {!editingUser && (
                                <div className="space-y-3">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4 opacity-80">Security Access Key (Password)</label>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        className="w-full px-10 py-6 bg-white/50 border border-white/80 rounded-2xl focus:ring-8 focus:ring-orange-500/5 focus:border-orange-500 outline-none transition-all duration-500 font-black text-gray-900 shadow-sm"
                                        value={formData.password}
                                        placeholder="••••••••"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            )}

                            <button className="group relative w-full py-7 bg-gray-900 text-white font-black rounded-[2rem] overflow-hidden transition-all hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] hover:-translate-y-1 active:scale-[0.98] mt-10">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative z-10 uppercase tracking-[0.4em] text-[10px]">Execute Configuration Save</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Management;

