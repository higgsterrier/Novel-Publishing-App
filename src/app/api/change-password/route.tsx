import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { verifyToken, hashPassword, comparePasswords } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    const { db } = await dbConnect();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $set: { password: hashedNewPassword } }
      );

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in POST /api/change-password:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
