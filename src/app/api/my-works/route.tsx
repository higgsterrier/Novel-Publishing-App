import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Types } from "mongoose";
import Novel from "@/models/Novel";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Find all novels by the user
    const userId = new Types.ObjectId(decodedToken.userId);
    const query = {
      $or: [
        { author: userId },  // Old format
        { "author._id": userId }  // New format
      ]
    };
    console.log('Query:', query); // Debug log
    
    const novels = await Novel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found novels:', novels); // Debug log
    return NextResponse.json(novels);
  } catch (error) {
    console.error("Error in GET /api/my-works:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
