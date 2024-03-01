import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asynchandler.js"
import { User } from "../models/user.model.js";
import { refreshAcessToken } from "../controllers/user.controller.js";



// test controller for renewing access token
export const verifyJwt =async(req, res, next) => {
    
    try {
        const token = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        
        if(!token){
            console.log("access token not found")
            // const refreshTokenResponse = await refreshAcessToken();
            // console.log(refreshTokenResponse);
            // if(refreshAcessToken().valid){
            //     next()
            //     return;
            // }
           if(refreshAcessToken(req,res)){
            console.log("refreshAcessToken used" )
            next()
            return;
           }
        } else{
            console.log("Access token found, 45");
            const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
            if(!user){
                res.status(401).json("Invalid Token");
            }
                req.user = user;
            // console.log(req.user)
            next();
            return
            
        
            
        }
    } catch (error) {
        res.status(401).json({error: error.message, message: "Invalid Token Unauthorized"});  
    }
   
};



    













































// export const verifyJwt =(async(req, res, next) => {
//     const token = req.cookies?.accessToken;
//     // console.log(req.cookies.accessToken);
//     if (!token) return new Error("Access token not found")

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if(err){
//             return new Error(err.message)
//         }
//         console.log(user)
//         req.user = user;
//         // console.log(req.user)
//         next();
//     });
// });