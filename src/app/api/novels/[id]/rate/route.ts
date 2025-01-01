import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Novel from "@/models/Novel";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) {
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

    // Get the novel and update its ratings
    const novel = await Novel.findById(params.id);
    if (!novel) {
      return NextResponse.json(
        { error: "Novel not found" },
        { status: 404 }
      );
    }

    // Find the user and check if they've already rated this novel
    const user = await User.findById(token.sub);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find existing rating by this user for this novel
    const existingRating = user.ratedNovels.find(
      (r: { novelId: { toString: () => string; }; }) => r.novelId.toString() === params.id
    );

    if (existingRating) {// Initialize ratings if they don't exist
    if (!novel.ratings) {
      novel.ratings = { totalScore: 0, count: 0 };
    }
    
    if (existingRating) {
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
    
      // Update novel's total score
      novel.ratings.totalScore = novel.ratings.totalScore - oldRating + rating;
    } else {
      // Rest of the code remains the same...
    }
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;

      // Update novel's total score
      novel.ratings.totalScore = novel.ratings.totalScore - oldRating + rating;
    } else {
      // Add new rating
      user.ratedNovels.push({
        novelId: new Types.ObjectId(params.id),
        rating: rating,
      });

      // Update novel's ratings
      novel.ratings = novel.ratings || { totalScore: 0, count: 0 };
      novel.ratings.totalScore = (novel.ratings.totalScore || 0) + rating;
      novel.ratings.count = (novel.ratings.count || 0) + 1;
    }

    // Save both documents
    await Promise.all([novel.save(), user.save()]);

    return NextResponse.json({
      message: "Rating updated successfully",
      newRating: {
        average: novel.ratings.totalScore / novel.ratings.count,
        count: novel.ratings.count,
      },
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    return NextResponse.json(
      { error: "Failed to update rating" },
      { status: 500 }
    );
  }
}
