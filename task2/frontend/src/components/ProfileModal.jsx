import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const AVATAR_SEEDS = ['Shadow', 'Felix', 'Luna', 'Rocky', 'Zoe', 'Buster', 'Cleo', 'Simba', 'Gizmo', 'Milo'];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const updatedData = { username };
    if (avatarSeed) {
      updatedData.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;
    }

    const res = await updateProfile(updatedData);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const randomizeAvatar = () => {
    const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)] + Math.floor(Math.random() * 100);
    setAvatarSeed(randomSeed);
  };

  const currentAvatar = avatarSeed
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`
    : user?.avatar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-md rounded-2xl border border-white/10 p-6 relative overflow-hidden text-slate-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <img
                src={currentAvatar}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-2xl border-2 border-indigo-500/50 bg-slate-900/60 p-2"
              />
              <button
                type="button"
                onClick={randomizeAvatar}
                className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-2 shadow-lg transition"
                title="Randomize Avatar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">Click icon to randomize robot seed</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <Check className="h-4 w-4" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
