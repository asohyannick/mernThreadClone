import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { StatusCodes } from "http-status-codes";
const createPost = async (req, res, next) => {
  try {
    const { postedBy, text, img } = req.body;
    if (!postedBy || !text) {
      return next(
        errorHandler(
          StatusCodes.BAD_REQUEST,
          "PostedBy and text fields are required"
        )
      );
    }
    const user = await User.findById(postedBy);
    if (!user) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "User not found!"));
    }
    if (user._id.toString() !== req.user.id.toString()) {
      return next(
        errorHandler(StatusCodes.UNAUTHORIZED, "Unauthorized to create post")
      );
    }
    const maxLength = 500;
    if (text.length > maxLength) {
      return next(
        errorHandler(
          StatusCodes.BAD_REQUEST,
          `Text must be less than ${maxLength} characters`
        )
      );
    }
    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    res
      .status(StatusCodes.CREATED)
      .json({ message: "Post created successfully", newPost });
  } catch (error) {
    next(error);
  }
};

export default {
  createPost,
};
