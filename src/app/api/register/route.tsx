import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  await dbConnect();

  const body = await request.json();
  const { name, email, password } = body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    return NextResponse.json({ message: "Invalid user data" }, { status: 400 });
  }
}
