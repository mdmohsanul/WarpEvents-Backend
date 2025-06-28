import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";
dotenv.config();

const generateAccessAndRefreshTokens = async (userId) => {
  // find user
  // generate access and refresh token
  // save refresh token in database
  // return access and refresh token

  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // now we have to save in DB but there is pasword validation in model, so to skip we user validateBeforeSave method
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generatingrefresh and access tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get the user details
  // validation - not empty
  // check if the user is already exists: username, email
  // create user object
  // remove password and refresh token field from response
  // check for user creation
  // save the details to database

  const {
    email,
    name,
    password,
  } = req.body;

  if (!email || !name || !password ) {
    throw new ApiError(400, "Missing required fields");
  }
  // check if the user doesn't pass empty string
  if ([email, password, name].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Required fields cannot be empty");
  }


  // check if the user already exists or not
  // $ give access to many operator like and , or, etc
  const existedUser = await User.findOne({
    $or: [{ name }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }


  // entry on database
  const user = await User.create({
    email,
    password,
    name,
  });

  // check if the user details is save in db or not.
  // if save then we have to send to frontend by removing the password and access token field

  // select will use to remove fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const { email, name, password } = req.body;
 
  if (!(name || email)) {
    throw new ApiError(400, "name or email is required");
  }
  const user = await User.findOne({
    $or: [{ name }, { email }],
  }).select("+password");
  if (!user) {
    throw new ApiError(404, "user doesn't exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
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
        "User loggedIn Successfully"
      )
    );
});

export {registerUser,loginUser}