import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookies.js";
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

const logout = async (res, next) => {
  try {
    res.cookies("access_token", { maxAge: 1 });
    res.status(StatusCodes.OK).json("User logged out successfully!");
  } catch (error) {
    next(error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById({ id });
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
      await User.findByIdAndUpdate(req.user_id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
    }
    res
      .status(StatusCodes.OK)
      .json("You are following this user successfully!");
  } catch (error) {
    next(error);
  }
};

const unFollowUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById({ id });
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
      await User.findByIdAndUpdate(req.user_id, { $push: { following: id } });
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
    }
    res
      .status(StatusCodes.OK)
      .json("You are unfollowing this user successfully!");
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const { name, email, username, password } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user)
      return next(errorHandler(StatusCodes.NOT_FOUND, "User not found!"));
    if (req.param.id !== userId.toString()) {
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
    user.name = nmae || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;
    user = await user.save();
    res
      .status(StatusCodes.OK)
      .json({ message: "Profile updated successfully!", user });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username })
      .select("-password")
      .select("-updatedAt");
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
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "User not found!"));
    }
    if (req.user.id !== user) {
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
  followUser,
  unFollowUser,
  updateUser,
  getUserProfile,
  deleteUser,
};