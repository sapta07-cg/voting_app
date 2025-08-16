import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    //get user details from frontend

    const { username, email, password } = req.body;

    // validation for all fields

    if ([username, email, password].some((field) => field?.trim() === "")) {
      console.log("checking error");
      throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    // check if user already exists

    if (existedUser) {
      throw new ApiError(409, "User with email or username already exists");
    }

    // const avatarLocalPath = req.files?.avatar[0]?.path;


    const avatar = await uploadOnCloudinary(req.files?.avatar[0]?.path);


    const userDetails = await User.create({
      username,
      email,
      password,
      avatar:avatar.url,
    });

    // remove password and refresh token field
    const createdUser = await User.findById(userDetails._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "user created successfully"))
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

export { registerUser };
