import Task from '../models/Task.js';

// @desc    Get task statistics for dashboard
// @route   GET /api/analytics/stats
// @access  Private
export const getTaskStats = async (req, res) => {
  try {
    let tasks;
    if (global.useMockDB) {
      const db = global.getMockDb();
      tasks = db.tasks.filter((t) => t.owner.toString() === req.user._id.toString());
    } else {
      tasks = await Task.find({ owner: req.user._id });
    }

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Done').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const todo = tasks.filter((t) => t.status === 'Todo').length;

    const lowPriority = tasks.filter((t) => t.priority === 'Low').length;
    const mediumPriority = tasks.filter((t) => t.priority === 'Medium').length;
    const highPriority = tasks.filter((t) => t.priority === 'High').length;

    // Monthly completed count (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyTrend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      
      const count = tasks.filter((t) => {
        if (t.status !== 'Done') return false;
        const taskDate = new Date(t.updatedAt || t.createdAt);
        return taskDate.getMonth() === d.getMonth() && taskDate.getFullYear() === d.getFullYear();
      }).length;

      // In mock mode, if there are no completed tasks in this month yet, let's seed a dynamic baseline so the charts look beautiful!
      const baselineCount = count > 0 ? count : (global.useMockDB ? (Math.round((i * 2.3 + 1) % 5)) : 0);

      monthlyTrend.push({
        name: monthName,
        Completed: baselineCount,
      });
    }

    res.json({
      summary: {
        total,
        completed,
        pending: inProgress + todo,
        todo,
        inProgress,
      },
      priority: [
        { name: 'Low', count: lowPriority },
        { name: 'Medium', count: mediumPriority },
        { name: 'High', count: highPriority },
      ],
      trend: monthlyTrend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
