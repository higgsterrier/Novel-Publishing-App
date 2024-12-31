import mongoose from "mongoose";

export interface IChapter {
  _id: string;
  title: string;
  content: string;
  novelId: string;
  chapterNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a chapter title"],
      maxlength: [200, "Chapter title cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide chapter content"],
    },
    novelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Novel",
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
ChapterSchema.index({ novelId: 1, chapterNumber: 1 }, { unique: true });

export default mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);
