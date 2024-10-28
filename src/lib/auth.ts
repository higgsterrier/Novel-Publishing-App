import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import User from "../models/User";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export const protect = async (req: NextRequest) => {
  let token;

  if (req.headers.get("authorization")?.startsWith("Bearer")) {
    try {
      token = req.headers.get("authorization")?.split(" ")[1];
      const decoded = jwt.verify(token!, JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return NextResponse.json(
          { message: "Not authorized, token failed" },
          { status: 401 }
        );
      }
      return user;
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Not authorized, token failed" },
        { status: 401 }
      );
    }
  }

  if (!token) {
    return NextResponse.json(
      { message: "Not authorized, no token" },
      { status: 401 }
    );
  }
};
