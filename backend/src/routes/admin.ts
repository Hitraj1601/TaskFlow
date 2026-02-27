import { Router, Request, Response } from "express";
import dbConnect from "../config/db";
import Task from "../models/Task";
import User from "../models/User";
import { authMiddleware, adminMiddleware, JwtPayload } from "../middleware/auth";

const router = Router();

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/v1/admin/users - List all users (admin only)
router.get("/users", async (_req: Request, res: Response): Promise<void> => {
  try {
    await dbConnect();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        users,
        total: users.length,
      },
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/v1/admin/tasks - List all tasks from all users (admin only)
router.get("/tasks", async (req: Request, res: Response): Promise<void> => {
  try {
    await dbConnect();

    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt((req.query.limit as string) || "10"))
    );
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(),
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
    console.error("Admin get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE /api/v1/admin/tasks/:id - Delete any task (admin only)
router.delete("/tasks/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    await dbConnect();

    const id = req.params.id as string;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
      return;
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully by admin",
    });
  } catch (error) {
    console.error("Admin delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PUT /api/v1/admin/users/:id/role - Update user role (admin only)
router.put("/users/:id/role", async (req: Request, res: Response): Promise<void> => {
  try {
    await dbConnect();

    const id = req.params.id as string;
    const { role } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    if (!role || !["user", "admin"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: user, admin",
      });
      return;
    }

    const authUser = (req as Request & { user: JwtPayload }).user;
    if (authUser.userId === id) {
      res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user },
    });
  } catch (error) {
    console.error("Admin update role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
