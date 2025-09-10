import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Candidate } from "../models/candidate.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const registerCandidate = asyncHandler(async (req, res) => {
  try {
    console.log("request from body", req.body);

    const { name, party, age } = req.body;

    if ([name, party].some((field) => field?.trim() === "")) {
      console.log("checking error");
      //   throw new ApiError(400, "All fields are required");
      return res.status(200).json(new ApiError(400, "All fields are required"));
    }

    if (!age) {
      throw new ApiError(400, "age is required ");
    }

    const existedCandidate = await Candidate.findOne({
      $and: [{ name }, { party }],
    });

    if (existedCandidate) {
      throw new ApiError(409, "Candidate already exists");
    }

    const candidateDetails = await Candidate.create({
      name,
      party,
      age,
    });

    const createdCandidate = await Candidate.findById(candidateDetails._id);

    if (!createdCandidate) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(200, createdCandidate, "candidate created successfully")
      );
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

const deleteCandidate = asyncHandler(async (req, res) => {
  try {
    const { candidateId } = req.params;

    console.log("cadidate id", candidateId);

    // if its ivalid id then we have to use this function

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.json(new ApiError(400, {}, "Invalid candidate ID"));
    }

    const response = await Candidate.findByIdAndDelete(candidateId);

    console.log("Response from server", response);

    if (response == null) {
      return res.status(404).json(new ApiError(404, {}, "Candidate not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Candidate deleted successfully"));
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export { registerCandidate, deleteCandidate };
