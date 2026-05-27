import Task from '../models/Task.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @desc    Get all user tasks (with search & filters)
// @route   GET /api/data
// @access  Private
export const getTasks = async (req, res) => {
  try {
    let tasks;
    if (global.useMockDB) {
      const db = global.getMockDb();
      tasks = db.tasks.filter((t) => t.owner.toString() === req.user._id.toString());
    } else {
      tasks = await Task.find({ owner: req.user._id });
    }

    // Apply Search
    const { search, status, priority } = req.query;
    if (search) {
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply Filters
    if (status) {
      tasks = tasks.filter((t) => t.status === status);
    }
    if (priority) {
      tasks = tasks.filter((t) => t.priority === priority);
    }

    // Sort by latest created
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/data
// @access  Private
export const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, attachments } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  try {
    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate,
      owner: req.user._id,
      attachments: attachments || [],
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/data/:id
// @access  Private
export const updateTask = async (req, res) => {
  const { title, description, status, priority, dueDate, attachments } = req.body;

  try {
    let task;
    if (global.useMockDB) {
      const db = global.getMockDb();
      task = db.tasks.find((t) => t._id.toString() === req.params.id.toString());
    } else {
      task = await Task.findById(req.params.id);
    }

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: title || task.title,
        description: description !== undefined ? description : task.description,
        status: status || task.status,
        priority: priority || task.priority,
        dueDate: dueDate || task.dueDate,
        attachments: attachments || task.attachments,
      },
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/data/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    let task;
    if (global.useMockDB) {
      const db = global.getMockDb();
      task = db.tasks.find((t) => t._id.toString() === req.params.id.toString());
    } else {
      task = await Task.findById(req.params.id);
    }

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify ownership
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload file attachment
// @route   POST /api/data/upload
// @access  Private
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({ fileUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
