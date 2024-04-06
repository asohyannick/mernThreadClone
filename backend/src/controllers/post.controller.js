import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { StatusCodes } from "http-status-codes";
import { v2 as cloudinary } from "cloudinary";
const createPost = async (req, res, next) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;
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
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
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

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "Post not found!"));
    }
    res.status(StatusCodes.OK).json(post);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "Post not found!"));
    }
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return next(
        errorHandler(
          StatusCodes.UNAUTHORIZED,
          "Unauthorized to delete this post!"
        )
      );
    }
    if (post.img) {
        const imgId = post.img.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(imgId);      
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(StatusCodes.OK).json("Post has been deleted successfully!");
  } catch (error) {
    next(error);
  }
};

const likeUnLikePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "Post not found!"));
    }
    const userUnLikePost = post.likes.includes(userId);
    if (userUnLikePost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(StatusCodes.OK).json("Post unliked successfully!");
    } else {
      // Like post
      post.likes.push(userId);
      await post.save();
      res.status(StatusCodes.OK).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    next(error);
  }
};

const replyToPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userPofilePic = req.user.profilePic;
    const username = req.user.username;
    if (!text) {
      return next(
        errorHandler(StatusCodes.BAD_REQUEST, "Text field is required!")
      );
    }
    const post = await Post.findById(postId);
    if (!post) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "Post not found!"));
    }
    const reply = { userId, text, userPofilePic, username };
    post.replies.push(reply);
    await post.save();
    res
      .status(StatusCodes.OK)
      .json({ message: "Reply added successfully", post });
  } catch (error) {
    next(error);
  }
};

const feedPost = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "User not found!"));
    }
    const following = user.following;
    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });
    res.status(StatusCodes.OK).json(feedPosts);
  } catch (error) {
    next(error);
  }
};

const getUserPosts = async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return next(errorHandler(StatusCodes.NOT_FOUND, "User not found!"));
    }
    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(StatusCodes.OK).json(posts);
  } catch (error) {
    next(error);
  }
};

export default {
  createPost,
  getPost,
  likeUnLikePost,
  replyToPost,
  feedPost,
  deletePost,
  getUserPosts,
};
