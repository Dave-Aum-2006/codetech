import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../utils/api.js';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  Layers, LogOut, LayoutDashboard, CheckSquare, Plus, Search,
  Edit, Trash2, Calendar, AlertCircle, FileText, CheckCircle2,
  TrendingUp, Circle, CheckCircle, Moon, Sun, ArrowUpCircle, Sparkles, X, ChevronRight, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardHub() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Navigation: 'dashboard' or 'tasks'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data States
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Form states (Create/Edit)
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('Todo');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAttachments, setFormAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Profile update state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Fetch Dashboard Stats & Tasks
  const loadDashboardData = async () => {
    setLoadingData(true);
    setErrorMsg('');
    try {
      // Fetch stats
      const statsRes = await api.get('/api/analytics/stats');
      setStats(statsRes.data);

      // Fetch tasks (with filters applied)
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const tasksRes = await api.get('/api/data', { params });
      setTasks(tasksRes.data);
    } catch (err) {
      setErrorMsg('Failed to sync dashboard details.');
    }
    setLoadingData(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [search, statusFilter, priorityFilter]);

  // Open Create Modal
  const openCreateModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormStatus('Todo');
    setFormPriority('Medium');
    setFormDueDate('');
    setFormAttachments([]);
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setFormAttachments(task.attachments || []);
  };

  // File upload logic
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/api/data/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormAttachments([...formAttachments, data.fileUrl]);
    } catch (err) {
      alert('File upload failed.');
    }
    setUploadingFile(false);
  };

  // Handle Create Submit
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      await api.post('/api/data', {
        title: formTitle,
        description: formDesc,
        status: formStatus,
        priority: formPriority,
        dueDate: formDueDate,
        attachments: formAttachments,
      });
      setIsCreateOpen(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to create task.');
    }
  };

  // Handle Edit Submit
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      await api.put(`/api/data/${editingTask._id}`, {
        title: formTitle,
        description: formDesc,
        status: formStatus,
        priority: formPriority,
        dueDate: formDueDate,
        attachments: formAttachments,
      });
      setEditingTask(null);
      loadDashboardData();
    } catch (err) {
      alert('Failed to update task.');
    }
  };

  // Handle Delete
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await api.delete(`/api/data/${taskId}`);
        loadDashboardData();
      } catch (err) {
        alert('Failed to delete task.');
      }
    }
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    setUpdatingProfile(true);
    try {
      const { data } = await api.put('/api/users/profile', { username: profileName });
      user.name = data.username;
      localStorage.setItem('saas_userInfo', JSON.stringify(user));
      setIsProfileOpen(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile settings.');
    }
    setUpdatingProfile(false);
  };

  // Helper colors
  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400';
      case 'Medium': return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
      default: return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case 'Done': return <CheckCircle2 className="h-4 w-4 text-indigo-500" />;
      case 'In Progress': return <TrendingUp className="h-4 w-4 text-sky-500" />;
      default: return <Circle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className={`min-h-screen flex bg-saas-light dark:bg-saas-dark text-slate-700 dark:text-slate-200 overflow-hidden font-sans transition-all duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-slate-200 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex flex-col justify-between shrink-0 p-5 z-20">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/10">
              <Layers className="h-5.5 w-5.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-800 dark:text-white tracking-tight">TaskFlow</h2>
              <span className="text-[10px] font-semibold text-slate-400">Team Workspace</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <CheckSquare className="h-4.5 w-4.5" />
              <span>Task Board</span>
            </button>
          </div>
        </div>

        {/* Footer User Info Panel */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/5">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 transition text-left"
          >
            <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-lg bg-slate-800 p-0.5 border border-white/5" />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </button>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 py-2 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-600/10 transition flex items-center justify-center"
              title="Theme Mode"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={logout}
              className="flex-1 py-2 rounded-xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-red-500/10 transition flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 z-10">
        
        {/* VIEW 1: DASHBOARD HUB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-1.5 tracking-tight">
                <Sparkles className="h-5.5 w-5.5 text-indigo-500" />
                Workspace Hub
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Visual task analytics & completed pipelines trends</p>
            </div>

            {/* Loading / Error states */}
            {loadingData && !stats && (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            )}

            {stats && (
              <>
                {/* Stats Counters Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-[120px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Projects</span>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.summary.total}</h3>
                  </div>
                  <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-[120px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-indigo-500">Completed</span>
                    <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{stats.summary.completed}</h3>
                  </div>
                  <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-[120px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-sky-500">Pending Tasks</span>
                    <h3 className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-2">{stats.summary.pending}</h3>
                  </div>
                  <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-[120px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-emerald-500">Completion Rate</span>
                    <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                      {stats.summary.total > 0 ? Math.round((stats.summary.completed / stats.summary.total) * 100) : 0}%
                    </h3>
                  </div>
                </div>

                {/* Charts Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Trend chart */}
                  <div className="lg:col-span-2 glass-card rounded-3xl p-6 h-[300px]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Monthly Completion Velocity</h3>
                    <div className="w-full h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trend}>
                          <defs>
                            <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="Completed" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#completedGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Priority bar chart */}
                  <div className="glass-card rounded-3xl p-6 h-[300px]">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Task Priority Load</h3>
                    <div className="w-full h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.priority}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent tasks list */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recently Logged Tasks</h3>
                    <button onClick={() => setActiveTab('tasks')} className="text-xs text-indigo-500 font-semibold hover:underline flex items-center gap-1">
                      <span>View Tasks Board</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="glass-card rounded-2xl p-4 divide-y divide-slate-100 dark:divide-white/5">
                    {tasks.slice(0, 3).map((task) => (
                      <div key={task._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 truncate">
                          {getStatusIcon(task.status)}
                          <span className="font-semibold text-sm text-slate-800 dark:text-white truncate">{task.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-center py-6 text-xs text-slate-500">Workspace is empty. Create a task on the task board!</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW 2: TASKS BOARD HUB */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center w-full">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-1.5 tracking-tight">
                  <CheckSquare className="h-5.5 w-5.5 text-indigo-500" />
                  Task Board
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Add, update, search, and manage project cards</p>
              </div>

              <button
                onClick={openCreateModal}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/15"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Create Task</span>
              </button>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-col sm:flex-row gap-3 w-full border-b border-slate-200 dark:border-white/5 pb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-10 text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-4 text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl py-2 px-4 text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Task Grid cards */}
            {loadingData && tasks.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-20 text-slate-500">No tasks found. Try changing filters or add a new card!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {tasks.map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-white/5 flex flex-col justify-between h-[210px] relative overflow-hidden group"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(task.status)}
                          <span className="text-[10px] text-slate-400 font-bold tracking-wider">{task.status}</span>
                        </div>
                        <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-white line-clamp-1">{task.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Task Actions Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-auto">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No due date'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        {task.attachments?.length > 0 && (
                          <Paperclip className="h-3.5 w-3.5 text-indigo-400 mr-1" />
                        )}
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
                          title="Edit Task"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-red-500 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* CREATE TASK MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md rounded-2xl border border-white/10 p-6 relative text-slate-200"
            >
              <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Add New Task
              </h2>

              <form onSubmit={handleCreateTask} className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Task Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Description</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full h-20 bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Due Date</label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Attachment</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploadingFile}
                      className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 transition text-slate-300 flex items-center justify-center gap-1.5"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span>{uploadingFile ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                  </div>
                </div>

                {formAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formAttachments.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] px-2 py-0.5 rounded-md">
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-[80px]">File {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-xs shadow-lg shadow-indigo-600/10"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT TASK MODAL */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md rounded-2xl border border-white/10 p-6 relative text-slate-200"
            >
              <button onClick={() => setEditingTask(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Edit className="h-5 w-5 text-indigo-400" />
                Edit Task details
              </h2>

              <form onSubmit={handleUpdateTask} className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Task Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Description</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full h-20 bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Due Date</label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Attachment</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploadingFile}
                      className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 transition text-slate-300 flex items-center justify-center gap-1.5"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span>{uploadingFile ? 'Uploading...' : 'Upload File'}</span>
                    </button>
                  </div>
                </div>

                {formAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formAttachments.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] px-2 py-0.5 rounded-md">
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-[80px]">File {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-xs shadow-lg shadow-indigo-600/10"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER PROFILE MODAL */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md rounded-2xl border border-white/10 p-6 relative text-slate-200"
            >
              <button onClick={() => setIsProfileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-white mb-6">User Profile Settings</h2>

              <form onSubmit={handleProfileUpdate} className="space-y-5 text-sm">
                <div className="flex justify-center mb-4">
                  <img src={user?.avatar} alt={user?.name} className="w-20 h-20 rounded-2xl border-2 border-indigo-500/50 bg-slate-950/50 p-1" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2 px-3 text-slate-500 focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Display Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-xs disabled:opacity-50"
                  >
                    {updatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
