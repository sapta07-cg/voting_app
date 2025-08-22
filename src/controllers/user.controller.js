import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false }); // this saves data without checking validation

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

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
      avatar: avatar.url,
    });

    // remove password and refresh token field
    const createdUser = await User.findById(userDetails._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "user created successfully"));
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    //take data from user

    const { username, email, password } = req.body;

    console.log("data from req",email);

    //check validation username or email

    if (!(username || email)) {
      throw new ApiError(400, "username or email is required !!");
    }

    // find the user

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new ApiError(404, "user does not exist !");
    }

    //password check of user

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "password is not correct !");
    }

    // generate access and refresh token and sends to user

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged In Successfully"
        )
      );
  } catch (err) {
    console.error("Save Error", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

const logoutUser = asyncHandler(async (req,res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );

    // this is needed for cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .json(new ApiResponse(200, {}, "User logged out"));
  } catch (err) {
    console.error("Save Error", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

export { registerUser, loginUser, logoutUser };
