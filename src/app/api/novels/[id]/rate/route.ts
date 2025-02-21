import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Novel from "@/models/Novel";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { rating } = await req.json();
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating value" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const novel = await Novel.findById(params.id);
    if (!novel) {
      return NextResponse.json(
        { error: "Novel not found" },
        { status: 404 }
      );
    }

    // Find existing rating
    const existingRatingIndex = novel.ratings.findIndex(
      (r) => r.userId.toString() === user._id.toString()
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      novel.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      novel.ratings.push({
        userId: user._id,
        rating: rating,
      });
    }

    // Calculate average rating
    const totalRating = novel.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    novel.averageRating = totalRating / novel.ratings.length;

    await novel.save();

    return NextResponse.json({
      message: "Rating updated successfully",
      averageRating: novel.averageRating,
      userRating: rating,
    });
  } catch (error) {
    console.error("Rating error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
