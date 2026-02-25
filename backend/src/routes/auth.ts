import { Router, Request, Response } from "express";
import dbConnect from "../config/db";
import User from "../models/User";
import { signToken, setAuthCookie, removeAuthCookie, JwtPayload } from "../middleware/auth";
import { getAuthUser } from "../middleware/auth";
import { validateLogin, validateRegistration, sanitizeInput } from "../utils/validation";
import { encrypt } from "../utils/crypto";

const router = Router();

// POST /api/auth/register - Create a new user account
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    await dbConnect();
    const { name, email, password } = req.body;

    const errors = validateRegistration({ name, email, password });
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });
    setAuthCookie(res, token);
    const encryptedEmail = encrypt(user.email);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          encryptedEmail,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/auth/login - Authenticate user
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    await dbConnect();
    const { email, password } = req.body;

    const errors = validateLogin({ email, password });
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail }).select(
      "+password"
    );
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
    });
    setAuthCookie(res, token);
    const encryptedEmail = encrypt(user.email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          encryptedEmail,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/auth/logout - Clear authentication cookie
router.post("/logout", (_req: Request, res: Response): void => {
  try {
    removeAuthCookie(res);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/auth/me - Get current authenticated user info
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser: JwtPayload | null = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    await dbConnect();
    const user = await User.findById(authUser.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
