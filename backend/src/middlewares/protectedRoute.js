import User from "../models/user.model.js";
import { StatusCodes } from "http-status-codes";
import jwt from 'jsonwebtoken';
const protectedRoute = async(req, res, next) => {
    try{
        const token = req.cookies.access_token;
        if(!token) return res.status(StatusCodes.UNAUTHORIZED).json('Unauthorized');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        req.user = user;
        next();
    } catch(error) {
        next(error);
    }
}

export default protectedRoute;