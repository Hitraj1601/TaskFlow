import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { getAuthUser } from "@/lib/auth-api";
import {
  validateTaskTitle,
  validateTaskStatus,
  sanitizeInput,
} from "@/lib/validation";
import { encryptFields } from "@/lib/crypto";

// GET /api/tasks - List tasks with pagination, filtering, search
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

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

    return NextResponse.json({
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
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { title, description, status } = await request.json();

    const titleErrors = validateTaskTitle(title || "");
    if (titleErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: titleErrors },
        { status: 400 }
      );
    }

    if (status && !validateTaskStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status. Must be one of: todo, in-progress, done",
        },
        { status: 400 }
      );
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

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        data: { task: taskObj, encryptedTask },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
