import { Router, Request, Response } from "express";
import dbConnect from "../config/db";
import Task from "../models/Task";
import { authMiddleware, JwtPayload } from "../middleware/auth";
import {
  validateTaskTitle,
  validateTaskStatus,
  sanitizeInput,
} from "../utils/validation";
import { encryptFields } from "../utils/crypto";

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// GET /api/tasks - List tasks with pagination, filtering, search
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as Request & { user: JwtPayload }).user;
    await dbConnect();

    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt((req.query.limit as string) || "10"))
    );
    const status = req.query.status as string;
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;

    const query: Record<string, unknown> = { user: authUser.userId };
    if (status && validateTaskStatus(status)) {
      query.status = status;
    }
    if (search.trim()) {
      query.title = { $regex: sanitizeInput(search), $options: "i" };
    }

    const skip = (page - 1) * limit;
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/tasks - Create a new task
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as Request & { user: JwtPayload }).user;
    await dbConnect();

    const { title, description, status } = req.body;

    const titleErrors = validateTaskTitle(title || "");
    if (titleErrors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: titleErrors,
      });
      return;
    }

    if (status && !validateTaskStatus(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: todo, in-progress, done",
      });
      return;
    }

    const task = await Task.create({
      title: sanitizeInput(title),
      description: description ? sanitizeInput(description) : "",
      status: status || "todo",
      user: authUser.userId,
    });

    const taskObj = task.toObject();
    const encryptedTask = encryptFields(
      { ...taskObj, description: taskObj.description } as Record<
        string,
        unknown
      >,
      ["description"]
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task: taskObj, encryptedTask },
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/tasks/:id - Get a specific task
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as Request & { user: JwtPayload }).user;
    await dbConnect();

    const id = req.params.id as string;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
      return;
    }

    const task = await Task.findOne({ _id: id, user: authUser.userId });
    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as Request & { user: JwtPayload }).user;
    await dbConnect();

    const id = req.params.id as string;
    const { title, description, status } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
      return;
    }

    if (title !== undefined) {
      const titleErrors = validateTaskTitle(title);
      if (titleErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: titleErrors,
        });
        return;
      }
    }

    if (status !== undefined && !validateTaskStatus(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: todo, in-progress, done",
      });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = sanitizeInput(title);
    if (description !== undefined)
      updateData.description = sanitizeInput(description);
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
      return;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: authUser.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = (req as Request & { user: JwtPayload }).user;
    await dbConnect();

    const id = req.params.id as string;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
      return;
    }

    const task = await Task.findOneAndDelete({
      _id: id,
      user: authUser.userId,
    });

    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
