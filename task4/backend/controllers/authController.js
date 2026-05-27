import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    let userExists;
    if (global.useMockDB) {
      const db = global.getMockTrackerDb();
      userExists = db.users.find(u => u.email === email.toLowerCase());
    } else {
      userExists = await User.findOne({ email });
    }

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        settings: user.settings,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    let user;
    if (global.useMockDB) {
      const db = global.getMockTrackerDb();
      user = db.users.find(u => u.email === email.toLowerCase());
    } else {
      user = await User.findOne({ email });
    }

    if (user) {
      const isMatch = global.useMockDB 
        ? user.password === password
        : await user.matchPassword(password);

      if (isMatch) {
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          settings: user.settings,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile details
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      settings: user.settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
