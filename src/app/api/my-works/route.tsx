import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Novel from "@/models/Novel";
import User from "@/models/User"; // Added import statement for User model

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Find all novels by the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const query = {
      author: user._id
    };
    console.log('Query:', query); // Debug log
    
    const novels = await Novel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found novels:', novels); // Debug log

    // Serialize the novels before sending to frontend
    const serializedNovels = novels.map(novel => ({
      ...novel,
      _id: novel._id.toString(),
      author: novel.author.toString()
    }));

    return NextResponse.json(serializedNovels);
  } catch (error) {
    console.error("Error in GET /api/my-works:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
