import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Candidate } from "../models/candidate.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const checkAdminRole= async(userId)=>{
  try {
    const user= await User.findById(userId);

    if(user.role==="admin"){
      return true
    }
  } catch (error) {
    return false;
  }

}

const registerCandidate = asyncHandler(async (req, res) => {
  try {

    if(!checkAdminRole(req.user?._id)){
      return res.status(403).json(new ApiError(403, {}, "user does not have admin role"))
    }
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

const updateCandidate = asyncHandler(async (req, res) => {
  try {
    const { candidateId } = req.params;

    console.log("cadidate id", candidateId);

    const { name, party, age } = req.body;

    if (!name || !party || !age) {
      return res
        .status(400)
        .json(new ApiError(400, {}, "All fields are required"));
    }

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          name,
          party,
          age,
        },
      },
      { new: true },
      { runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json(new ApiError(404, "Candidate not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          candidate,
          "Candidate details updated successfully"
        )
      );
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const getAllCandidate = asyncHandler(async (req, res) => {
  try {
    const response = await Candidate.find({},{name:1,party:1,_id:0});

    console.log("response from server", response);

    if (!response) {
      return res
        .status(500)
        .json(new ApiError(500, "Something wrong while fetching data"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, response, "Candidate details fetched successfully")
      );
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const getCandidateById = asyncHandler(async (req, res) => {
  try {
    const { candidateId } = req.params;

    console.log("cadidate id", candidateId);
    const response = await Candidate.findById(candidateId);

    console.log("response from server", response);

    if (!response) {
      return res.status(404).json(new ApiError(404, "Candidate not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, response, "Candidate details fetched successfully")
      );
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

//vote controllers

const castVote = asyncHandler(async (req, res) => {
  try {
    const { candidateId } = req.params;

    console.log("cadidate id", candidateId);

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json(new ApiError(404, "Candidate not found"));
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json(new ApiError(404, "user not found"));
    }

    if (user.role == "admin") {
      return res.status(403).json(new ApiError(403, "admin is not allowed"));
    }

    if (user.isVoted) {
      return res.status(400).json(new ApiError(403, {},"you have already voted"));
    }

    // Update the Candidate document to record the vote

    candidate.votes.push({ user: req.user._id });
    candidate.voteCount++;

    await candidate.save();

    // update the user document

    user.isVoted = true;
    await user.save();

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "user voted successfully"))
  } catch (error) {
     console.error("Save error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const countVote= asyncHandler(async(req,res)=>{
  try {
    // Find all candidates and sort them by voteCount in descending order
    const candidateData= await Candidate.find().sort({voteCount:"desc"})

    const finalData= candidateData.map((data)=>{
      return{
        party: data.party,
        count:data.voteCount
      }
    })

    return res
    .status(200)
    .json(new ApiResponse(200,finalData,"Data fetched successfully"))
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Internal server error." });
  }

})

export {
  registerCandidate,
  deleteCandidate,
  updateCandidate,
  getAllCandidate,
  getCandidateById,
  castVote,
  countVote
};
