import mongoose, { Schema } from "mongoose";

const candidateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    party: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    votes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Candidate = mongoose.model("Candidate", candidateSchema);
