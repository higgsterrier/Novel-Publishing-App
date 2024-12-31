import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          return null;
        }

        const isPasswordValid = await comparePasswords(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  }
};

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
      const decoded = jwt.verify(token!, JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId).select("-password");
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
