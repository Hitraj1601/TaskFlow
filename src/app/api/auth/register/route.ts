import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth-api";
import { validateRegistration, sanitizeInput } from "@/lib/validation";
import { encrypt } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password } = await request.json();

    const errors = validateRegistration({ name, email, password });
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(token);
    const encryptedEmail = encrypt(user.email);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            encryptedEmail,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "User with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
