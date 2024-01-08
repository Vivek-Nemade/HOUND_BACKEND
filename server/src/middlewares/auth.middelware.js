import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asynchandler.js"
import { User } from "../models/user.model.js";


export const verifyJwt =asyncHandler (async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            res.status(401); throw new Error("Unathorized token")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            res.status(401); throw new Error("Invalid token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        res.status(401); throw new Error(error?.message)
    }
})