import React, { useState, useEffect } from 'react';
import { X, UserMinus, UserPlus, Settings, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import { motion } from 'framer-motion';

export default function GroupInfoModal({ isOpen, onClose, chat, onUpdateChat, onLeaveChat }) {
  const { user: currentUser } = useAuth();
  const [groupName, setGroupName] = useState(chat?.chatName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = chat?.groupAdmin?._id === currentUser?._id;

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
        // Filter out users already in group
        const filtered = data.filter((u) => !chat.users.some((cu) => cu._id === u._id));
        setSearchResults(filtered);
      } catch (err) {
        setError('Failed to fetch search results.');
      }
      setLoadingSearch(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, chat]);

  if (!isOpen || !chat) return null;

  const handleRename = async () => {
    if (!groupName.trim() || groupName === chat.chatName) {
      setIsEditingName(false);
      return;
    }
    setLoadingAction(true);
    try {
      const { data } = await api.put('/api/chat/rename', {
        chatId: chat._id,
        chatName: groupName,
      });
      onUpdateChat(data);
      setIsEditingName(false);
    } catch (err) {
      setError('Failed to rename group.');
    }
    setLoadingAction(false);
  };

  const handleAddUser = async (userToAdd) => {
    setLoadingAction(true);
    try {
      const { data } = await api.put('/api/chat/groupadd', {
        chatId: chat._id,
        userId: userToAdd._id,
      });
      onUpdateChat(data);
      setSearch('');
    } catch (err) {
      setError('Failed to add user to group.');
    }
    setLoadingAction(false);
  };

  const handleRemoveUser = async (userToRemove) => {
    setLoadingAction(true);
    try {
      const { data } = await api.put('/api/chat/groupremove', {
        chatId: chat._id,
        userId: userToRemove._id,
      });
      onUpdateChat(data);
    } catch (err) {
      setError('Failed to remove user.');
    }
    setLoadingAction(false);
  };

  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave the group?')) {
      setLoadingAction(true);
      try {
        await api.put('/api/chat/groupremove', {
          chatId: chat._id,
          userId: currentUser._id,
        });
        onLeaveChat(chat._id);
        onClose();
      } catch (err) {
        setError('Failed to leave group.');
      }
      setLoadingAction(false);
    }
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
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header / Name */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Group Details</h2>
          <div className="flex items-center gap-3">
            {isEditingName && isAdmin ? (
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  disabled={loadingAction}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 transition flex items-center"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xl font-bold text-white">{chat.chatName}</span>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-indigo-400 p-1"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Admin: {chat.groupAdmin?.username}</p>
        </div>

        {/* Error Alert */}
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        {/* Add Members (Admin Only) */}
        {isAdmin && (
          <div className="mb-5 space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Add New Member
            </label>
            <input
              type="text"
              placeholder="Search user to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            {/* Search list dropdown */}
            {search && (
              <div className="bg-slate-950/50 border border-white/5 rounded-xl max-h-[120px] overflow-y-auto p-1 space-y-1">
                {loadingSearch ? (
                  <div className="text-center py-2 text-xs text-slate-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-2 text-xs text-slate-500">No users found</div>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleAddUser(u)}
                      disabled={loadingAction}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition text-left text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.username} className="w-6 h-6 rounded-md bg-slate-800 p-0.5" />
                        <span className="text-slate-200 font-medium">{u.username}</span>
                      </div>
                      <UserPlus className="h-4 w-4 text-indigo-400" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Member List */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Members ({chat.users.length})
          </label>
          <div className="max-h-[180px] overflow-y-auto space-y-1 pr-1 bg-slate-950/30 border border-white/5 rounded-xl p-2">
            {chat.users.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition text-sm"
              >
                <div className="flex items-center gap-2">
                  <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-lg bg-slate-800 p-0.5" />
                  <div>
                    <div className="font-medium text-slate-200 flex items-center gap-1.5">
                      {u.username}
                      {chat.groupAdmin?._id === u._id && (
                        <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded-full">
                          Admin
                        </span>
                      )}
                      {currentUser?._id === u._id && (
                        <span className="text-slate-500 text-xs">(You)</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">{u.email}</div>
                  </div>
                </div>

                {isAdmin && chat.groupAdmin?._id !== u._id && (
                  <button
                    onClick={() => handleRemoveUser(u)}
                    disabled={loadingAction}
                    className="text-slate-400 hover:text-red-400 p-1 transition"
                    title="Remove user"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex justify-between border-t border-white/10 pt-4">
          <button
            onClick={handleLeaveGroup}
            disabled={loadingAction}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 font-semibold px-3 py-2 rounded-lg hover:bg-red-500/10 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Leave Group</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition text-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
