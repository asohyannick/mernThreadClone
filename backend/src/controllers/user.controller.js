import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import Post from "../models/post.model.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookies.js";
import { v2 as cloudinary } from "cloudinary";
const signup = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return next(errorHandler(StatusCodes.BAD_REQUEST, "User already exists"));
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = bcryptjs.hashSync(password, salt);
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();
    if (newUser) {
      generateTokenAndSetCookies(newUser._id, res);
      res.status(StatusCodes.CREATED).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST, "Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = bcryptjs.compareSync(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return next(errorHandler(StatusCodes.BAD_REQUEST, "Invalid Credentials"));
    }
    generateTokenAndSetCookies(user._id, res);
    res.status(StatusCodes.OK).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.cookie("access_token", { maxAge: 1 });
    res.status(StatusCodes.OK).json("User logged out successfully!");
  } catch (error) {
    next(error);
  }
};

const followUnFollowUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return next(
        errorHandler(
          StatusCodes.BAD_REQUEST,
          "You cannot folow or unfollow yourself."
        )
      );
    }
    if (!userToModify || !currentUser) {
      return next(errorHandler(StatusCodes.BAD_REQUEST, "User not found!"));
    }
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user_id, { $push: { following: id } });
      res
        .status(StatusCodes.OK)
        .json("You are following this user successfully!");
    } else if (!isFollowing) {
      // unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user_id, { $pull: { following: id } });
      res
        .status(StatusCodes.OK)
        .json("You have unfollowed this user successfully!");
    }
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const { name, email, username, password, bio } = req.body;
  const { profilePic } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user)
      return next(errorHandler(StatusCodes.NOT_FOUND, "User not found!"));
    if (req.params.id !== userId.toString()) {
      return next(
        errorHandler(
          StatusCodes.BAD_REQUEST,
          "You cannot update other user's profile"
        )
      );
    }
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = bcryptjs.hashSync(password, salt);
      user.password = hashedPassword;
    }
    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadResponse.secure_url;
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;
    user = await user.save();
    // Find all post that this user replies and update username and userProfilePic fields.
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );
    // password should be null in response
    user.password = null;
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
  }
};

const getSuggestedUsers = async (req, res, next) => {
  try {
    // exclude the current user from suggested users array and exclude users that current user is already following
    const userId = req.user._id;

    const usersFollowedByYou = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(StatusCodes.OK).json(suggestedUsers);
  } catch (error) {
    next(error);
  }
};

const freezeAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(errorHandler(StatusCodes.BAD_REQUEST, "User not found"));
    }

    user.isFrozen = true;
    await user.save();

    res.status(StatusCodes.OK).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  // we will fetch get user profile either by username or userId
  const { query } = req.params;
  // we will fetch username
  try {
    let user;
    // query is either username or userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      // query is username
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }
    if (!user) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "User not found!"));
    }
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const userId = req.user._id;
    if (!user) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "User not found!"));
    }
    if (req.user.id !== userId.toString()) {
      return next(
        errorHandler(
          StatusCodes.UNAUTHORIZED,
          "You are not allowed to delete this user!"
        )
      );
    }
    await User.findByIdAndDelete(user);
    res.status(StatusCodes.OK).json("User deleted successfully!");
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  signin,
  logout,
  followUnFollowUser,
  updateUser,
  getUserProfile,
  deleteUser,
  getSuggestedUsers,
  freezeAccount,
};
