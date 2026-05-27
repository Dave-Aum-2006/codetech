import React, { useState, useEffect } from 'react';
import { X, Search, Check, Sparkles } from 'lucide-react';
import api from '../utils/api.js';
import { motion, AnimatePresence } from 'framer-motion';

export default function GroupChatModal({ isOpen, onClose, onCreateGroup }) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoadingSearch(true);
      setError('');
      try {
        const { data } = await api.get(`/api/users?search=${search}`);
        setSearchResults(data);
      } catch (err) {
        setError('Failed to fetch search results.');
      }
      setLoadingSearch(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  if (!isOpen) return null;

  const handleSelectUser = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('Please provide a group name.');
      return;
    }

    if (selectedUsers.length < 2) {
      setError('Please select at least 2 users.');
      return;
    }

    setSubmitting(true);
    try {
      const userIds = selectedUsers.map((u) => u._id);
      const { data } = await api.post('/api/chat/group', {
        name: groupName,
        users: JSON.stringify(userIds),
      });
      onCreateGroup(data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group.');
    }
    setSubmitting(false);
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedUsers([]);
    setSearch('');
    setSearchResults([]);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-md rounded-2xl border border-white/10 p-6 relative overflow-hidden text-slate-200"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          Create Group Chat
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Dream Team"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Add Members
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition"
              />
            </div>
          </div>

          {/* Selected Chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-1 max-h-[80px] overflow-y-auto">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs px-2.5 py-1 rounded-full"
                >
                  <span>{user.username}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="hover:text-white transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1 bg-slate-950/40 rounded-xl p-2 border border-white/5">
            {loadingSearch ? (
              <div className="text-center py-4 text-xs text-slate-500">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                {search ? 'No users found' : 'Type to search users'}
              </div>
            ) : (
              searchResults.map((user) => {
                const isSelected = selectedUsers.some((u) => u._id === user._id);
                return (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition text-left text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-lg bg-slate-800 p-0.5"
                      />
                      <div>
                        <div className="font-medium text-slate-200">{user.username}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="bg-indigo-600 rounded-md p-1">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedUsers.length < 2 || !groupName.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium transition disabled:opacity-50 text-sm flex items-center gap-1.5"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
