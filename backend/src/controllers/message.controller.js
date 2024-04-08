import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { StatusCodes} from "http-status-codes";
import { errorHandler } from "../utils/error.js";
async function sendMessage(re, res, next) {
  try {
    const { recipientId, message } = req.body;
    let { img } = req.body;
    const senderId = req.user._id;
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || "",
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }
    res.status(StatusCodes.CREATED).json({ error: error.message });
  } catch (error) {
    next(error);
  }
}

async function getMessages(req, res, next) {
  const { otherUserId } = req.params;
  const userId = req.user._id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });
    if (!conversation) {
      return next(
        errorHandler(StatusCodes.BAD_REQUEST, "Conversation not found!")
      );
    }
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });
    res.status(StatusCodes.OK).json({ error: error.message });
  } catch (error) {
    next(error);
  }
}

async function getConversations(req, res, next) {
  const userId = req.user._id;
  try {
    const conversation = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profilePic",
    });
    conversation.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    res.status(StatusCodes.OK).json(conversation);
  } catch (error) {}
}

export default {
  sendMessage,
  getMessages,
  getConversations,
};
