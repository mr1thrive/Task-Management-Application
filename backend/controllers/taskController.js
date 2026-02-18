const Task = require("../models/Task");

/**
 * Create a task (POST /api/tasks)
 * - Requires JWT (req.user.id from auth middleware)
 * - Associates created task with the logged-in user
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      description: description || "",
      deadline: deadline || null,
      status: status || "pending",
    });

    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get tasks (GET /api/tasks)
 * Supports query params for filtering/searching/sorting:
 *  - status=pending|in-progress|completed
 *  - q=<search in title>
 *  - sortBy=createdAt|deadline|title|status
 *  - order=asc|desc
 */
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      status,
      q,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Always scope tasks to the authenticated user
    const filter = { user: userId };

    // Filter by status
    if (status && ["pending", "in-progress", "completed"].includes(status)) {
      filter.status = status;
    }

    // Search by title
    if (q && q.trim()) {
      filter.title = { $regex: q.trim(), $options: "i" };
    }

    // Safe sorting
    const allowedSort = new Set(["createdAt", "deadline", "title", "status"]);
    const safeSortBy = allowedSort.has(sortBy) ? sortBy : "createdAt";
    const safeOrder = order === "asc" ? 1 : -1;

    const tasks = await Task.find(filter).sort({ [safeSortBy]: safeOrder });

    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Update a task (PUT /api/tasks/:id)
 * - Only the owner can update
 * - Allows updating title, description, deadline, status
 */
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findOne({ _id: taskId, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const allowedFields = ["title", "description", "deadline", "status"];
    for (const field of allowedFields) {
      if (field in req.body) {
        task[field] = req.body[field];
      }
    }

    // Normalize title if provided
    if (typeof task.title === "string") {
      task.title = task.title.trim();
    }

    await task.save();
    return res.json(task);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Delete a task (DELETE /api/tasks/:id)
 * - Only the owner can delete
 */
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findOne({ _id: taskId, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    await task.deleteOne();
    return res.json({ message: "Task removed" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
