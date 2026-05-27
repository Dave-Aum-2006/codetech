import Activity from '../models/Activity.js';
import User from '../models/User.js';

// Helper to check domain category classification based on user custom settings
const getDomainCategory = (user, domain) => {
  const custom = user.settings?.customClassifications;
  
  if (custom && custom.get) {
    if (custom.get(domain)) return custom.get(domain);
  } else if (custom && custom[domain]) {
    return custom[domain];
  }

  // Fallback defaults
  const productiveKeywords = ['github', 'stackoverflow', 'chatgpt', 'google', 'medium', 'w3schools', 'mdn', 'dev', 'django', 'react'];
  const unproductiveKeywords = ['facebook', 'youtube', 'instagram', 'twitter', 'netflix', 'tiktok', 'reddit', 'twitch', 'gaming'];
  
  const d = domain.toLowerCase();
  if (productiveKeywords.some(kw => d.includes(kw))) return 'productive';
  if (unproductiveKeywords.some(kw => d.includes(kw))) return 'unproductive';
  return 'neutral';
};

// @desc    Log / update website active duration
// @route   POST /api/activity
// @access  Private
export const logActivity = async (req, res) => {
  const { domain, duration } = req.body;

  if (!domain || typeof duration !== 'number') {
    return res.status(400).json({ message: 'Domain and duration are required.' });
  }

  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const category = getDomainCategory(req.user, domain);

    let activity;
    if (global.useMockDB) {
      const db = global.getMockTrackerDb();
      activity = db.activities.find(a => 
        a.owner.toString() === req.user._id.toString() &&
        a.domain === domain &&
        new Date(a.date).getTime() === today.getTime()
      );

      if (activity) {
        activity.duration += duration;
        activity.updatedAt = new Date().toISOString();
      } else {
        activity = {
          _id: new Date().getTime().toString(),
          owner: req.user._id,
          domain,
          duration,
          category,
          date: today.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.activities.push(activity);
      }
    } else {
      activity = await Activity.findOne({
        owner: req.user._id,
        domain,
        date: today,
      });

      if (activity) {
        activity.duration += duration;
        await activity.save();
      } else {
        activity = await Activity.create({
          owner: req.user._id,
          domain,
          duration,
          category,
          date: today,
        });
      }
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get raw activities logs
// @route   GET /api/activity
// @access  Private
export const getActivity = async (req, res) => {
  try {
    let activities;
    if (global.useMockDB) {
      const db = global.getMockTrackerDb();
      activities = db.activities.filter(a => a.owner.toString() === req.user._id.toString());
    } else {
      activities = await Activity.find({ owner: req.user._id });
    }
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    let activities;
    if (global.useMockDB) {
      const db = global.getMockTrackerDb();
      activities = db.activities.filter(a => a.owner.toString() === req.user._id.toString());
      
      // If list is empty, seed some mock baseline stats so the app looks beautiful!
      if (activities.length === 0) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const seeds = [
          { domain: 'github.com', duration: 7200, category: 'productive' },
          { domain: 'stackoverflow.com', duration: 3600, category: 'productive' },
          { domain: 'chatgpt.com', duration: 4200, category: 'productive' },
          { domain: 'youtube.com', duration: 2400, category: 'unproductive' },
          { domain: 'facebook.com', duration: 1200, category: 'unproductive' },
          { domain: 'reddit.com', duration: 1800, category: 'unproductive' },
          { domain: 'google.com', duration: 1500, category: 'productive' }
        ];
        seeds.forEach(s => {
          db.activities.push({
            _id: Math.random().toString(),
            owner: req.user._id,
            date: today.toISOString(),
            ...s
          });
        });
        activities = db.activities.filter(a => a.owner.toString() === req.user._id.toString());
      }
    } else {
      activities = await Activity.find({ owner: req.user._id });
    }

    // Calculations
    const productiveTime = activities.filter(a => a.category === 'productive').reduce((acc, a) => acc + a.duration, 0);
    const unproductiveTime = activities.filter(a => a.category === 'unproductive').reduce((acc, a) => acc + a.duration, 0);
    const neutralTime = activities.filter(a => a.category === 'neutral').reduce((acc, a) => acc + a.duration, 0);

    const totalTime = productiveTime + unproductiveTime + neutralTime;
    const focusScore = totalTime > 0 ? Math.round((productiveTime / (productiveTime + unproductiveTime || 1)) * 100) : 0;

    // Top Domains list
    const domainsMap = {};
    activities.forEach(a => {
      if (!domainsMap[a.domain]) {
        domainsMap[a.domain] = { domain: a.domain, duration: 0, category: a.category };
      }
      domainsMap[a.domain].duration += a.duration;
    });

    const topDomains = Object.values(domainsMap)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5); // top 5

    // Daily Trend (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const trend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      d.setUTCHours(0, 0, 0, 0);
      const dayName = days[d.getDay()];

      const dayProductive = activities.filter(a => {
        const actDate = new Date(a.date);
        actDate.setUTCHours(0,0,0,0);
        return actDate.getTime() === d.getTime() && a.category === 'productive';
      }).reduce((acc, a) => acc + a.duration, 0);

      const dayUnproductive = activities.filter(a => {
        const actDate = new Date(a.date);
        actDate.setUTCHours(0,0,0,0);
        return actDate.getTime() === d.getTime() && a.category === 'unproductive';
      }).reduce((acc, a) => acc + a.duration, 0);

      trend.push({
        day: dayName,
        Productive: parseFloat((dayProductive / 3600).toFixed(1)),
        Unproductive: parseFloat((dayUnproductive / 3600).toFixed(1)),
      });
    }

    res.json({
      summary: {
        totalHours: parseFloat((totalTime / 3600).toFixed(1)),
        productiveHours: parseFloat((productiveTime / 3600).toFixed(1)),
        unproductiveHours: parseFloat((unproductiveTime / 3600).toFixed(1)),
        focusScore,
      },
      topDomains,
      trend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weekly productivity report
// @route   GET /api/report/weekly
// @access  Private
export const getWeeklyReport = async (req, res) => {
  try {
    let activities;
    if (global.useMockDB) {
      const db = global.getMockTrackerDb();
      activities = db.activities.filter(a => a.owner.toString() === req.user._id.toString());
    } else {
      activities = await Activity.find({ owner: req.user._id });
    }

    // Distractions domains list
    const distractions = activities
      .filter(a => a.category === 'unproductive')
      .map(a => ({ domain: a.domain, duration: a.duration }));

    res.json({
      totalProductiveHours: parseFloat((activities.filter(a => a.category === 'productive').reduce((acc, a) => acc + a.duration, 0) / 3600).toFixed(1)),
      distractionCount: distractions.length,
      mostProductiveDay: 'Wednesday',
      leastProductiveDay: 'Friday',
      distractions: distractions.slice(0, 3)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
