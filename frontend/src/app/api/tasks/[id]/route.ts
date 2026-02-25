import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { getAuthUser } from "@/lib/auth-api";
import { validateTaskTitle, validateTaskStatus, sanitizeInput } from "@/lib/validation";

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID format" },
        { status: 400 }
      );
    }

    const task = await Task.findOne({ _id: id, user: authUser.userId });
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { task } });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const { title, description, status } = await request.json();

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID format" },
        { status: 400 }
      );
    }

    if (title !== undefined) {
      const titleErrors = validateTaskTitle(title);
      if (titleErrors.length > 0) {
        return NextResponse.json(
          { success: false, message: "Validation failed", errors: titleErrors },
          { status: 400 }
        );
      }
    }

    if (status !== undefined && !validateTaskStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status. Must be one of: todo, in-progress, done",
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = sanitizeInput(title);
    if (description !== undefined)
      updateData.description = sanitizeInput(description);
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: authUser.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID format" },
        { status: 400 }
      );
    }

    const task = await Task.findOneAndDelete({
      _id: id,
      user: authUser.userId,
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
