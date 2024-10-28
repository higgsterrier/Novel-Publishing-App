import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  await dbConnect();

  const body = await request.json();
  const { email, password } = body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }
}
