import mongoose from 'mongoose';

const useMockDb = () => {
  console.log('==================================================');
  console.log('⚠️  DATABASE WARNING: Could not connect to MongoDB.');
  console.log('🚀 Bootstrapping in-memory database fallback...');
  console.log('👉 GlowChat is running in OFFLINE MOCK MODE.');
  console.log('==================================================');
  
  const db = {
    users: [],
    chats: [],
    messages: []
  };

  class MockQuery {
    constructor(data) {
      this.data = data;
    }
    populate() { return this; }
    sort() { return this; }
    select() { return this; }
    find() { return this; }
    then(onResolve) {
      return Promise.resolve(onResolve ? onResolve(this.data) : this.data);
    }
    catch() { return this; }
  }

  // Override Model functions
  mongoose.Model.findOne = function(query) {
    const modelName = this.modelName;
    let found = null;
    
    if (modelName === 'User') {
      if (query.$or) {
        const [q1, q2] = query.$or;
        found = db.users.find(u => 
          (q1.email && u.email === q1.email) || 
          (q1.username && u.username === q1.username) ||
          (q2 && q2.email && u.email === q2.email) ||
          (q2 && q2.username && u.username === q2.username)
        );
      } else if (query.email) {
        found = db.users.find(u => u.email === query.email);
      } else if (query.username) {
        found = db.users.find(u => u.username === query.username);
      }
    } else if (modelName === 'Chat') {
      if (query._id) {
        found = db.chats.find(c => c._id.toString() === query._id.toString());
      }
    }
    return new MockQuery(found);
  };

  mongoose.Model.findById = function(id) {
    const modelName = this.modelName;
    let found = null;
    const idStr = id ? id.toString() : '';
    
    if (modelName === 'User') {
      found = db.users.find(u => u._id.toString() === idStr);
    } else if (modelName === 'Chat') {
      found = db.chats.find(c => c._id.toString() === idStr);
    } else if (modelName === 'Message') {
      found = db.messages.find(m => m._id.toString() === idStr);
    }
    return new MockQuery(found);
  };

  mongoose.Model.find = function(query = {}) {
    const modelName = this.modelName;
    let results = [];
    
    if (modelName === 'User') {
      let excludeId = null;
      if (query._id && query._id.$ne) {
        excludeId = query._id.$ne.toString();
      }
      results = db.users;
      if (excludeId) {
        results = results.filter(u => u._id.toString() !== excludeId);
      }
      if (query.$or) {
        const keyword = query.$or[0].username.$regex;
        results = results.filter(u => 
          u.username.toLowerCase().includes(keyword.toLowerCase()) || 
          u.email.toLowerCase().includes(keyword.toLowerCase())
        );
      }
    } else if (modelName === 'Chat') {
      let userId = null;
      if (query.users && query.users.$elemMatch && query.users.$elemMatch.$eq) {
        userId = query.users.$elemMatch.$eq.toString();
      }
      results = db.chats;
      if (userId) {
        results = results.filter(c => c.users.some(u => u._id.toString() === userId || u.toString() === userId));
      }
    } else if (modelName === 'Message') {
      if (query.chat) {
        results = db.messages.filter(m => m.chat.toString() === query.chat.toString() || m.chat._id?.toString() === query.chat.toString());
      }
    }
    
    results = JSON.parse(JSON.stringify(results));
    if (modelName === 'Chat') {
      results.forEach(c => {
        c.users = c.users.map(uId => db.users.find(u => u._id.toString() === uId.toString()) || uId);
        if (c.groupAdmin) {
          c.groupAdmin = db.users.find(u => u._id.toString() === c.groupAdmin.toString()) || c.groupAdmin;
        }
        if (c.latestMessage) {
          const msg = db.messages.find(m => m._id.toString() === c.latestMessage.toString());
          if (msg) {
            msg.sender = db.users.find(u => u._id.toString() === msg.sender.toString()) || msg.sender;
            c.latestMessage = msg;
          }
        }
      });
    } else if (modelName === 'Message') {
      results.forEach(m => {
        m.sender = db.users.find(u => u._id.toString() === m.sender.toString()) || m.sender;
        m.chat = db.chats.find(c => c._id.toString() === m.chat.toString()) || m.chat;
      });
    }
    
    return new MockQuery(results);
  };

  mongoose.Model.create = async function(data) {
    const modelName = this.modelName;
    const doc = {
      _id: new mongoose.Types.ObjectId().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    
    if (modelName === 'User') {
      db.users.push(doc);
      doc.matchPassword = async function(pass) {
        return pass === this.password;
      };
    } else if (modelName === 'Chat') {
      db.chats.push(doc);
    } else if (modelName === 'Message') {
      db.messages.push(doc);
    }
    return doc;
  };

  mongoose.Model.findByIdAndUpdate = function(id, update, options) {
    const modelName = this.modelName;
    let found = null;
    const idStr = id ? id.toString() : '';
    
    if (modelName === 'Chat') {
      const idx = db.chats.findIndex(c => c._id.toString() === idStr);
      if (idx > -1) {
        if (update.$push && update.$push.users) {
          db.chats[idx].users.push(update.$push.users);
        } else if (update.$pull && update.$pull.users) {
          db.chats[idx].users = db.chats[idx].users.filter(uId => uId.toString() !== update.$pull.users.toString());
        } else if (update.latestMessage) {
          db.chats[idx].latestMessage = update.latestMessage;
        } else if (update.chatName) {
          db.chats[idx].chatName = update.chatName;
        }
        db.chats[idx].updatedAt = new Date().toISOString();
        found = db.chats[idx];
      }
    } else if (modelName === 'User') {
      const idx = db.users.findIndex(u => u._id.toString() === idStr);
      if (idx > -1) {
        db.users[idx] = { ...db.users[idx], ...update, updatedAt: new Date().toISOString() };
        found = db.users[idx];
      }
    }
    
    if (found) {
      found = JSON.parse(JSON.stringify(found));
      if (modelName === 'Chat') {
        found.users = found.users.map(uId => db.users.find(u => u._id.toString() === uId.toString()) || uId);
        found.groupAdmin = db.users.find(u => u._id.toString() === found.groupAdmin?.toString()) || found.groupAdmin;
      }
    }
    return new MockQuery(found);
  };

  mongoose.Model.updateMany = function(query, update) {
    return new MockQuery({ modifiedCount: 1 });
  };
  
  mongoose.Model.prototype.save = async function() {
    const modelName = this.constructor.modelName;
    const doc = this.toObject();
    
    if (modelName === 'User') {
      const idx = db.users.findIndex(u => u._id.toString() === doc._id.toString());
      if (idx > -1) {
        db.users[idx] = { ...db.users[idx], ...doc, updatedAt: new Date().toISOString() };
      } else {
        db.users.push(doc);
      }
      this.matchPassword = async function(pass) { return pass === this.password; };
    }
    return this;
  };
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realtime_chat');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    useMockDb();
  }
};

export default connectDB;
