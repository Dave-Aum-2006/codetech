import mongoose from 'mongoose';

const useMockDb = () => {
  console.log('==================================================');
  console.log('⚠️  DATABASE WARNING: Could not connect to MongoDB.');
  console.log('🚀 Bootstrapping in-memory database fallback...');
  console.log('👉 GlowTracker is running in OFFLINE MOCK MODE.');
  console.log('==================================================');
  
  global.useMockDB = true;

  const db = {
    users: [],
    activities: []
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
    } else if (modelName === 'Activity') {
      if (query.owner && query.domain && query.date) {
        // Query to match a domain log on a specific date YYYY-MM-DD
        const dateStr = new Date(query.date).toISOString().split('T')[0];
        found = db.activities.find(a => 
          a.owner.toString() === query.owner.toString() &&
          a.domain === query.domain &&
          new Date(a.date).toISOString().split('T')[0] === dateStr
        );
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
    } else if (modelName === 'Activity') {
      found = db.activities.find(a => a._id.toString() === idStr);
    }
    return new MockQuery(found);
  };

  mongoose.Model.find = function(query = {}) {
    const modelName = this.modelName;
    let results = [];
    
    if (modelName === 'User') {
      results = db.users;
    } else if (modelName === 'Activity') {
      results = db.activities;
      if (query.owner) {
        results = results.filter(a => a.owner.toString() === query.owner.toString());
      }
      if (query.date) {
        // Handle range query if date has $gte / $lte
        if (query.date.$gte && query.date.$lte) {
          const gte = new Date(query.date.$gte);
          const lte = new Date(query.date.$lte);
          results = results.filter(a => {
            const actDate = new Date(a.date);
            return actDate >= gte && actDate <= lte;
          });
        }
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
    } else if (modelName === 'Activity') {
      db.activities.push(doc);
    }
    return doc;
  };

  mongoose.Model.findByIdAndUpdate = function(id, update, options) {
    const modelName = this.modelName;
    let found = null;
    const idStr = id ? id.toString() : '';
    
    if (modelName === 'User') {
      const idx = db.users.findIndex(u => u._id.toString() === idStr);
      if (idx > -1) {
        // Apply settings changes or regular updates
        db.users[idx] = { ...db.users[idx], ...update, updatedAt: new Date().toISOString() };
        found = db.users[idx];
      }
    } else if (modelName === 'Activity') {
      const idx = db.activities.findIndex(a => a._id.toString() === idStr);
      if (idx > -1) {
        // Handle increment
        if (update.$inc && update.$inc.duration) {
          db.activities[idx].duration += update.$inc.duration;
        } else {
          db.activities[idx] = { ...db.activities[idx], ...update };
        }
        db.activities[idx].updatedAt = new Date().toISOString();
        found = db.activities[idx];
      }
    }
    
    if (found) {
      found = JSON.parse(JSON.stringify(found));
    }
    return new MockQuery(found);
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

  global.getMockTrackerDb = () => db;
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/productivity');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.useMockDB = false;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    useMockDb();
  }
};

export default connectDB;
