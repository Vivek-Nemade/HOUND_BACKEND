import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"


const generateRefreshAccessToken = async(userId)=>{
    try {
       const user = await User.findById(userId)
       const accessToken = user.generatAccessToken()
       const refreshToken = user.generatRefreshToken();   

       user.refreshToken = refreshToken;
       
       await user.save({validateBeforeSave: false});
        // console.log(user)
       return {accessToken, refreshToken}
    } catch (error) {
        console.error(error.message)
    //    return res.status(500); throw new Error("Something went wrong while generating referesh and access token")
    }
}
const generateUserId = async () => {
    const currentYear = new Date().getFullYear();
    const userCountInYear = await User.countDocuments({
      createdAt: {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1),
      },
    });
  
    const userId = `${currentYear}${userCountInYear + 1}`;
    return userId;
  };

const registerUser = asyncHandler( async (req,res)=>{

    const {userName, email, password,fullName} =req.body;
    console.log(email,password)

    if([userName, email, password,fullName].some((field)=> field?.trim()==="")){
        res.status(400); throw new Error("All fields must be filled")
    }

    const existingUser = await User.findOne({
        $or: [{userName, email}]
    })

    if(existingUser){
        res.status(409); throw new Error("User already exists")
    }
    console.log(req.files)
//    const localProfileImagePath = req.files?.profileImage[0]?.path;
//    console.log(localProfileImagePath)
//    const localCoverImagePath = req.files?.coverImage[0]?.path;

//    if(!localProfileImagePath){
//     res.status(400); throw new Error("Profile Image is required")
//    }


//    const profileImage =  await uploadCloudinary(localProfileImagePath)
//    const coverImage = await uploadCloudinary(localCoverImagePath)

//    if(!profileImage){
//     res.status(400); throw new Error("Profile Image is required")
//    }
//    console.log(username, email,profileImage,coverImage,password)

   const userId = await generateUserId()

   const user = await User.create({
        userId,
        userName: userName.toLowerCase(), 
        email,
        fullName,
        // profileImage:profileImage.url, 
        // coverImage:coverImage?.url || "",
        password
    })

   const createdUser= await User.findById(user.id).select("-password -refreshToken");
   if(!createdUser){
    res.status(500); throw new Error("Error creating user")
   }

    return res.status(201).json(createdUser); 
})


const loginUser = asyncHandler(async (req, res) =>{
    const {email, password} = req.body;
    // console.log(email,password)

    if(!email){
        res.status(400); throw new Error("email is required")
    }

    const user = await User.findOne({email});

    if(!user){
        res.status(401); throw new Error("User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        res.status(401); throw new Error("Invalid Credentials")
    }

    const {accessToken, refreshToken} = await generateRefreshAccessToken(user._id)
    console.log(refreshToken)


    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // if(req.cookies[`${user._id}`]){
    //     console.log(user._id)
    //     req.cookies[`${user._id}`]="";
    // }
    const expiryDate = new Date(Date.now() + 3600000)
    const options = {
        httpOnly: true,
        // sameSite:"lax",
        expires: expiryDate
    }

    res
    .cookie('accessToken', accessToken, {maxAge: 3000000, httpOnly: true})
    // .cookie("refreshToken", refreshToken, options)
    .cookie("refreshToken", refreshToken, {maxAge: 86400000, httpOnly: true})
    // return res.
    //         status(200)
    //         .cookie("accessToken", accessToken, options)
    //         .cookie("refreshToken", refreshToken, options)
    //         // .json(LoggedInUser + accessToken +refreshToken +"User logged in successfully")
    //         .json({LoggedInUser})
    // console.log(accessToken,"and",refreshToken)
    return res.status(200).json({LoggedInUser})
})

const logoutUser=asyncHandler(async (req, res) =>{
    const id = req?.user?._id
    await User.findByIdAndUpdate(
        id,
        {
           $unset:{
            refreshToken: 1,  // removes the refresh token from the user object
           }
        },
        {
            new: true
        }
        )

    const options = {
        httpOnly : true,
        secure : true
    }
    
    return res.status(200)
              .clearCookie("accessToken",options)
              .clearCookie("refreshToken",options)
              .json("User Logged Out")
})

const getUser = asyncHandler(async (req,res) =>{
    // console.log(req.user)
    const user = await User.findOne({_id:req?.user?._id}).select("-password -refreshToken")
    // console.log(user.username)
    return res.status(200).json({user, valid:true});
});

const uploadUserimages=asyncHandler(async (req,res) =>{
    const userID ="659e73d9a8095b5620115d90"
    try {
        const localProfileImagePath = req.files?.profileImage[0]?.path;
        const localCoverImagePath = req.files?.coverImage[0]?.path;
    
    
        const profileImage =  await uploadCloudinary(localProfileImagePath)
        const coverImage = await uploadCloudinary(localCoverImagePath)
    
        const updatedUser = await User.findByIdAndUpdate(
            userID,
            {
                $set:{
                    profileImage: profileImage.url,
                    coverImage: coverImage.url
                }
            },
            {
                new: true,
            }
            ).select('profileImage coverImage')
    
            return res.status(201).json(updatedUser);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(error);
    }
});

const updateUserData = asyncHandler(async(req,res)=>{
    const {github,linkedln,youtube,website,twitter,bio,userName,email,fullName } = req.body;
    const currentUserId = req.user?._id;

    if(!currentUserId) {
        return res.status(404).json("User not found");
    }

    const user = await User.findByIdAndUpdate(currentUserId,
             {
                $set:{
                    userName,
                    email,
                    fullName,
                    github,
                    linkedln,
                    youtube,
                    website,
                    twitter,
                    bio
                }
             },{new :true}).select("-password -refreshToken")

             return res.status(200).json({user, message:"User updated successfully"})

})

const refreshAcessToken =asyncHandler (async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken
    let exist = false;
    if (!incomingRefreshToken) {
        return res.status(401).json({message: 'Refresh token not available, Unauthorized request',valid: false});
    }
    
    
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        console.log(decodedToken);
        const user = await User.findById(decodedToken?._id)
        console.log({'db-refresh token':user.refreshToken, "browser-refresh token":incomingRefreshToken})
        if(!user) {
           return res.status(401).json({ message: 'Invalid refresh token', valid: false })
        }
        if(incomingRefreshToken !==user?.refreshToken) {
                return res.status(401).json({ message: 'Invalid refresh token', valid: false })
        }
            const {accessToken, refreshToken} = await generateRefreshAccessToken(user._id)
        console.log(`new refresh token: ${refreshToken}`)
        console.log(`new access token: ${accessToken}`)
        
         res.
                status(200)
                .cookie("accessToken",accessToken,{maxAge: 3000000, httpOnly: true})
                .cookie("refreshToken",refreshToken,{maxAge: 86400000, httpOnly: true})
                .json({ message: 'Access Token Refreshed', valid: true })
        
                exist = true
    
    // catch(error){
    //     console.error('Error refreshing access token:', error);
    //     return res.status(401).json({ error: error.message, valid: false });
    // }  
        

        
    
    // console.log(exist)
    return exist;
            // res.status(401); throw new Error("Invalid token")
            // return res.status(401).json({error: error.message, exists: false});
    })

export { registerUser,loginUser,logoutUser,getUser,uploadUserimages,updateUserData,refreshAcessToken}