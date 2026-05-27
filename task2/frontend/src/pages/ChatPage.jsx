import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../utils/api.js';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import ProfileModal from '../components/ProfileModal.jsx';
import GroupChatModal from '../components/GroupChatModal.jsx';
import GroupInfoModal from '../components/GroupInfoModal.jsx';
import {
  MessageSquareCode,
  Search,
  Plus,
  Send,
  Paperclip,
  Smile,
  LogOut,
  User,
  Sun,
  Moon,
  ChevronLeft,
  Users,
  Image,
  FileText,
  Music,
  Check,
  CheckCheck,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { theme, toggleTheme } = useTheme();

  // State
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  
  // Typing state
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Emojis state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Unread message notifications count
  const [notifications, setNotifications] = useState({});

  // Responsive: View Toggle ('sidebar' or 'chat')
  const [currentView, setCurrentView] = useState('sidebar');

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  // Fetch all chats
  const fetchAllChats = async () => {
    setLoadingChats(true);
    try {
      const { data } = await api.get('/api/chat');
      setChats(data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
    setLoadingChats(false);
  };

  useEffect(() => {
    fetchAllChats();
  }, []);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await api.get(`/api/messages/${selectedChat._id}`);
        setMessages(data);
        
        // Join room
        if (socket) {
          socket.emit('join-chat', selectedChat._id);
        }

        // Clear notification for this chat
        setNotifications((prev) => {
          const next = { ...prev };
          delete next[selectedChat._id];
          return next;
        });

      } catch (err) {
        console.error('Error fetching messages:', err);
      }
      setLoadingMessages(false);
    };

    fetchMessages();
    setOtherUserTyping(false);
    setShowEmojiPicker(false);
  }, [selectedChat, socket]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    socket.on('message-received', (newMessageReceived) => {
      const chatOfMessage = newMessageReceived.chat;
      
      // Update latest message in chat list
      setChats((prevChats) => {
        const updated = prevChats.map((c) => {
          if (c._id === chatOfMessage._id) {
            return { ...c, latestMessage: newMessageReceived };
          }
          return c;
        });
        // Re-order by latest
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });

      if (selectedChat && selectedChat._id === chatOfMessage._id) {
        setMessages((prev) => [...prev, newMessageReceived]);
        // Update seen on server/sockets
        socket.emit('read-chat', { chatId: selectedChat._id, userId: user._id });
      } else {
        // Increment notifications count
        setNotifications((prev) => {
          const next = { ...prev };
          next[chatOfMessage._id] = (next[chatOfMessage._id] || 0) + 1;
          return next;
        });
      }
    });

    socket.on('typing', (room) => {
      if (selectedChat && selectedChat._id === room) {
        setOtherUserTyping(true);
      }
    });

    socket.on('stop-typing', (room) => {
      if (selectedChat && selectedChat._id === room) {
        setOtherUserTyping(false);
      }
    });

    socket.on('chat-read-by-user', ({ chatId, userId }) => {
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.sender._id !== userId && !msg.readBy.includes(userId)) {
              return { ...msg, readBy: [...msg.readBy, userId] };
            }
            return msg;
          })
        );
      }
    });

    return () => {
      socket.off('message-received');
      socket.off('typing');
      socket.off('stop-typing');
      socket.off('chat-read-by-user');
    };
  }, [socket, selectedChat, user]);

  // Handle Search for Users
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setLoadingSearch(true);
      try {
        const { data } = await api.get(`/api/users?search=${search}`);
        setSearchResults(data);
      } catch (err) {
        console.error('Error searching users:', err);
      }
      setLoadingSearch(false);
    };

    const delayDebounce = setTimeout(searchUsers, 450);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Access or Create a 1-to-1 Chat
  const handleAccessChat = async (targetUserId) => {
    setSearch('');
    try {
      const { data } = await api.post('/api/chat', { userId: targetUserId });
      if (!chats.some((c) => c._id === data._id)) {
        setChats((prev) => [data, ...prev]);
      }
      setSelectedChat(data);
      setCurrentView('chat');
    } catch (err) {
      console.error('Error opening chat:', err);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (socket) {
      socket.emit('stop-typing', selectedChat._id);
    }
    setIsTyping(false);

    const txt = messageText;
    setMessageText('');

    try {
      const { data } = await api.post('/api/messages', {
        content: txt,
        chatId: selectedChat._id,
      });

      if (socket) {
        socket.emit('new-message', data);
      }
      setMessages((prev) => [...prev, data]);
      
      // Update local chats list latestMessage
      setChats((prevChats) => {
        const index = prevChats.findIndex((c) => c._id === selectedChat._id);
        if (index > -1) {
          const updated = [...prevChats];
          updated[index] = { ...updated[index], latestMessage: data };
          return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        return prevChats;
      });

    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Typing emitter logic
  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (!socket || !selectedChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', selectedChat._id);
      setIsTyping(false);
    }, 2500);
  };

  // File Uploading & Sharing
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/api/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Send uploaded file details as a message
      const response = await api.post('/api/messages', {
        chatId: selectedChat._id,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileType: data.fileType,
      });

      if (socket) {
        socket.emit('new-message', response.data);
      }
      setMessages((prev) => [...prev, response.data]);

      // Update latest message in chats list
      setChats((prevChats) => {
        const index = prevChats.findIndex((c) => c._id === selectedChat._id);
        if (index > -1) {
          const updated = [...prevChats];
          updated[index] = { ...updated[index], latestMessage: response.data };
          return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        return prevChats;
      });

    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading file');
    }
    setUploadingFile(false);
  };

  // Render attachment in Chat Bubble
  const renderAttachment = (msg) => {
    if (!msg.fileUrl) return null;

    const isImage = msg.fileType.startsWith('image/');
    const isAudio = msg.fileType.startsWith('audio/');

    if (isImage) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden max-w-xs border border-white/10 shadow bg-slate-950/20">
          <img src={msg.fileUrl} alt={msg.fileName} className="w-full h-auto object-cover max-h-56" />
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="mt-2 flex items-center gap-2 p-2 rounded-xl bg-slate-950/20 border border-white/5 max-w-xs">
          <Music className="h-5 w-5 text-indigo-400 shrink-0" />
          <audio src={msg.fileUrl} controls className="w-44 h-8 text-xs focus:outline-none" />
        </div>
      );
    }

    return (
      <div className="mt-2 flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/30 border border-white/10 text-xs text-white max-w-xs">
        <div className="flex items-center gap-2 truncate">
          <FileText className="h-5 w-5 text-indigo-400 shrink-0" />
          <div className="truncate">
            <p className="font-medium truncate">{msg.fileName}</p>
            <p className="text-[10px] text-slate-400">File Attachment</p>
          </div>
        </div>
        <a
          href={msg.fileUrl}
          download={msg.fileName}
          target="_blank"
          rel="noreferrer"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-1.5 transition shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  };

  // Helper: Get other user in a 1-to-1 Chat
  const getOtherUser = (chatUsers) => {
    return chatUsers.find((u) => u._id !== user._id);
  };

  // Render status icon inside Message Bubble
  const renderMessageStatus = (msg) => {
    if (msg.sender._id !== user._id) return null;
    
    // Check if other users read it (excluding current user)
    const isRead = selectedChat.users.some(
      (u) => u._id !== user._id && msg.readBy.includes(u._id)
    );

    if (isRead) {
      return <CheckCheck className="h-3.5 w-3.5 text-indigo-400" />;
    }
    return <Check className="h-3.5 w-3.5 text-slate-500" />;
  };

  return (
    <div className={`relative min-h-screen flex bg-slate-900 text-slate-100 ${theme === 'dark' ? 'dark' : ''} overflow-hidden font-sans`}>
      {/* Background Decorative Glow Accents */}
      <div className="glow-accent top-[-100px] left-[-100px]" />
      <div className="glow-accent-blue bottom-[-150px] right-[-150px]" />

      <div className="w-full h-screen z-10 flex p-3 md:p-5 gap-3 md:gap-5">
        
        {/* SIDEBAR VIEW */}
        <div
          className={`glass border border-white/10 rounded-3xl flex flex-col w-full md:w-[350px] lg:w-[400px] shrink-0 transition-all duration-300 ${
            currentView === 'sidebar' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsProfileOpen(true)} className="relative group">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="w-10 h-10 rounded-xl bg-slate-800 p-0.5 border border-indigo-500/30 hover:border-indigo-500 transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-slate-900 rounded-full" />
              </button>
              <div>
                <h3 className="font-bold text-sm text-white max-w-[120px] truncate">{user?.username}</h3>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">Online</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 text-slate-300 transition"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
              <button
                onClick={() => setIsGroupOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 text-slate-300 transition"
                title="Create Group"
              >
                <Plus className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-300 transition"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-5 py-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users to start chat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/30 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 transition"
              />
            </div>
            {/* Search list overlays */}
            {search && (
              <div className="absolute left-5 right-5 mt-2 bg-slate-900/95 border border-white/10 rounded-2xl shadow-xl z-20 max-h-[220px] overflow-y-auto p-1.5 space-y-1 backdrop-blur-md">
                {loadingSearch ? (
                  <div className="text-center py-4 text-xs text-slate-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-500">No users found</div>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleAccessChat(u._id)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition text-left"
                    >
                      <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-lg bg-slate-800 p-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-white">{u.username}</div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Direct & Groups</p>
            {loadingChats ? (
              // Skeletal Loader
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">No chats available. Find a user to connect!</div>
            ) : (
              chats.map((chat) => {
                const isGroup = chat.isGroupChat;
                const other = isGroup ? null : getOtherUser(chat.users);
                const isChatSelected = selectedChat?._id === chat._id;
                const isOnline = isGroup ? false : other && onlineUsers.has(other._id);
                const unread = notifications[chat._id] || 0;

                const displayName = isGroup ? chat.chatName : other?.username;
                const displayAvatar = isGroup
                  ? `https://api.dicebear.com/7.x/identicon/svg?seed=${chat.chatName}`
                  : other?.avatar;

                return (
                  <button
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat);
                      setCurrentView('chat');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isChatSelected
                        ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border-indigo-500/40 shadow-inner'
                        : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="relative shrink-0">
                        <img
                          src={displayAvatar}
                          alt={displayName}
                          className="w-11 h-11 rounded-xl bg-slate-800 p-0.5 border border-white/5"
                        />
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-slate-900 rounded-full" />
                        )}
                      </div>
                      <div className="text-left truncate">
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span className="truncate">{displayName}</span>
                          {isGroup && <Users className="h-3 w-3 text-indigo-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {chat.latestMessage ? (
                            <>
                              <span className="font-medium text-slate-500 mr-1">
                                {chat.latestMessage.sender._id === user._id ? 'You:' : `${chat.latestMessage.sender.username}:`}
                              </span>
                              {chat.latestMessage.content || (chat.latestMessage.fileUrl ? '📷 Attachment' : '')}
                            </>
                          ) : (
                            <span className="text-[10px] italic text-slate-600">No messages yet</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {chat.latestMessage && (
                        <span className="text-[9px] text-slate-500">
                          {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                      {unread > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT AREA VIEW */}
        <div
          className={`glass border border-white/10 rounded-3xl flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
            currentView === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <button
                    onClick={() => setCurrentView('sidebar')}
                    className="md:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white mr-1"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="relative shrink-0">
                    <img
                      src={
                        selectedChat.isGroupChat
                          ? `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedChat.chatName}`
                          : getOtherUser(selectedChat.users)?.avatar
                      }
                      alt={selectedChat.isGroupChat ? selectedChat.chatName : getOtherUser(selectedChat.users)?.username}
                      className="w-10 h-10 rounded-xl bg-slate-800 p-0.5 border border-white/5"
                    />
                    {!selectedChat.isGroupChat && onlineUsers.has(getOtherUser(selectedChat.users)?._id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border border-slate-900 rounded-full" />
                    )}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-sm text-white truncate">
                      {selectedChat.isGroupChat ? selectedChat.chatName : getOtherUser(selectedChat.users)?.username}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {selectedChat.isGroupChat
                        ? `${selectedChat.users.length} members`
                        : onlineUsers.has(getOtherUser(selectedChat.users)?._id)
                        ? 'Online'
                        : 'Offline'}
                    </p>
                  </div>
                </div>

                {selectedChat.isGroupChat && (
                  <button
                    onClick={() => setIsGroupInfoOpen(true)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
                  >
                    <Users className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isMe = msg.sender._id === user._id;
                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <img
                              src={msg.sender.avatar}
                              alt={msg.sender.username}
                              className="w-7 h-7 rounded-lg bg-slate-800 p-0.5 shrink-0"
                            />
                          )}

                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                            {!isMe && selectedChat.isGroupChat && (
                              <span className="text-[10px] text-slate-500 font-medium ml-1.5 mb-1">
                                {msg.sender.username}
                              </span>
                            )}
                            <div
                              className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                                isMe
                                  ? 'bg-gradient-to-tr from-indigo-500 to-violet-600 text-white rounded-br-none'
                                  : 'glass border border-white/5 text-slate-200 rounded-bl-none'
                              }`}
                            >
                              {msg.content && <p>{msg.content}</p>}
                              {renderAttachment(msg)}
                              
                              <div className="flex items-center gap-1 mt-1.5 justify-end">
                                <span className={`text-[8px] ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {isMe && renderMessageStatus(msg)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {otherUserTyping && (
                      <div className="flex items-center gap-2">
                        <div className="glass border border-white/5 py-2.5 px-4 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 mr-1">Typing</span>
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10 relative">
                {/* Emoji Picker overlay */}
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-4 z-30 shadow-2xl">
                    <EmojiPicker
                      theme={theme}
                      onEmojiClick={(emojiObj) => setMessageText((prev) => prev + emojiObj.emoji)}
                    />
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-indigo-400 text-slate-400 transition"
                      title="Emojis"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-indigo-400 text-slate-400 transition disabled:opacity-50"
                      title="Attach File"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={messageText}
                    onChange={handleTyping}
                    placeholder={uploadingFile ? 'Uploading file...' : 'Write your message...'}
                    disabled={uploadingFile}
                    className="flex-1 bg-slate-950/40 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/40 transition disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={!messageText.trim() || uploadingFile}
                    className="p-3 bg-gradient-to-tr from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition disabled:opacity-40"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            // Welcome empty state
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]" />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/25 mb-4 z-10">
                <MessageSquareCode className="h-9 w-9 animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2 z-10">Welcome to GlowChat</h2>
              <p className="text-slate-400 text-sm max-w-sm z-10">
                Select a room from the sidebar or search for users to start exchanging real-time secure messages instantly.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Profile settings modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Group Create modal */}
      <AnimatePresence>
        {isGroupOpen && (
          <GroupChatModal
            isOpen={isGroupOpen}
            onClose={() => setIsGroupOpen(false)}
            onCreateGroup={(newChat) => {
              setChats((prev) => [newChat, ...prev]);
              setSelectedChat(newChat);
              setCurrentView('chat');
            }}
          />
        )}
      </AnimatePresence>

      {/* Group Info Modal */}
      <AnimatePresence>
        {isGroupInfoOpen && (
          <GroupInfoModal
            isOpen={isGroupInfoOpen}
            chat={selectedChat}
            onClose={() => setIsGroupInfoOpen(false)}
            onUpdateChat={(updatedChat) => {
              setSelectedChat(updatedChat);
              setChats((prev) => prev.map((c) => (c._id === updatedChat._id ? updatedChat : c)));
            }}
            onLeaveChat={(chatId) => {
              setSelectedChat(null);
              setChats((prev) => prev.filter((c) => c._id !== chatId));
              setCurrentView('sidebar');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
