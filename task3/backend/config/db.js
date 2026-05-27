import mongoose from 'mongoose';

const useMockDb = () => {
  console.log('==================================================');
  console.log('⚠️  DATABASE WARNING: Could not connect to MongoDB.');
  console.log('🚀 Bootstrapping in-memory database fallback...');
  console.log('👉 GlowTask is running in OFFLINE MOCK MODE.');
  console.log('==================================================');
  
  global.useMockDB = true;

  const db = {
    users: [],
    tasks: []
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
      if (query.email) {
        found = db.users.find(u => u.email === query.email.toLowerCase());
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
    } else if (modelName === 'Task') {
      found = db.tasks.find(t => t._id.toString() === idStr);
    }
    return new MockQuery(found);
  };

  mongoose.Model.find = function(query = {}) {
    const modelName = this.modelName;
    let results = [];
    
    if (modelName === 'User') {
      results = db.users;
    } else if (modelName === 'Task') {
      results = db.tasks;
      if (query.owner) {
        results = results.filter(t => t.owner.toString() === query.owner.toString());
      }
    }
    
    results = JSON.parse(JSON.stringify(results));
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
    } else if (modelName === 'Task') {
      db.tasks.push(doc);
    }
    return doc;
  };

  mongoose.Model.findByIdAndUpdate = function(id, update, options) {
    const modelName = this.modelName;
    let found = null;
    const idStr = id ? id.toString() : '';
    
    if (modelName === 'Task') {
      const idx = db.tasks.findIndex(t => t._id.toString() === idStr);
      if (idx > -1) {
        db.tasks[idx] = { ...db.tasks[idx], ...update, updatedAt: new Date().toISOString() };
        found = db.tasks[idx];
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
    }
    return new MockQuery(found);
  };

  mongoose.Model.findByIdAndDelete = function(id) {
    const modelName = this.modelName;
    const idStr = id ? id.toString() : '';
    
    if (modelName === 'Task') {
      const idx = db.tasks.findIndex(t => t._id.toString() === idStr);
      if (idx > -1) {
        db.tasks.splice(idx, 1);
      }
    }
    return new MockQuery({ success: true });
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

  // Attach a helper to retrieve database state for controllers
  global.getMockDb = () => db;
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glowtask');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDB = false;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    useMockDb();
  }
};

export default connectDB;
