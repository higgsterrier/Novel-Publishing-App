import mongoose from "mongoose";

const NovelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    synopsis: {
      type: String,
      required: [true, "Please provide a synopsis"],
      maxlength: [500, "Synopsis cannot be more than 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide the novel content"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Novel || mongoose.model("Novel", NovelSchema);
