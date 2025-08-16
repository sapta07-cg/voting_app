
import mongoose, { Schema } from "mongoose";

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avatar: {
      type: String, // cloudinary url
      // required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this; //  here this represent every record of User model

  if (!user.isModified("password")) return next();

  try {
    // hash password generation

    const salt = await bcrypt.genSalt(10); // genSalt(round)  --> round parameter indicates the complexity of hashing algorithm

    // hash password

    const hashedPassword = await bcrypt.hash(user.password, salt);

    // override the plain password with hashed password
    user.password = hashedPassword;

    next();
  } catch (err) {
    return next(err);
  }
});

//Defining custom method

userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (e) {
    throw e;
  }
};

userSchema.methods.generateAccessToken= function(){
   return jwt.sign(
        {
            _id:this._id,
            email: this.email,
            username:this.username, 
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id:this._id, 
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env. REFRESH_TOKEN_EXPIRY}
    )

}



export const User = mongoose.model("User", userSchema);
