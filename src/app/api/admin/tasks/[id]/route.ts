import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { getAuthUser } from "@/lib/auth-api";

// DELETE /api/admin/tasks/[id] - Delete any task (admin only)
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

    if (authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied. Admin privileges required." },
        { status: 403 }
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

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully by admin",
    });
  } catch (error) {
    console.error("Admin delete task error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
