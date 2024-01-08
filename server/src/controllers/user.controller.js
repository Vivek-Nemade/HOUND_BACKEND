import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {uploadCloudinary} from "../utils/cloudinary.js"


const generateRefreshAccessToken = async(userId)=>{
    try {
       const user = await User.findById(userId)
       const accessToken = user.generatAccessToken()
       const refreshToken = user.generatRefreshToken();   

       user.refreshToken = refreshToken;
       
       await user.save({validateBeforeSave: false});
        console.log(user)
       return {accessToken, refreshToken}
    } catch (error) {
        console.error(error.message)
    //    return res.status(500); throw new Error("Something went wrong while generating referesh and access token")
    }
}


const registerUser = asyncHandler( async (req,res)=>{

    const {username, email, password} =req.body;
    console.log(email,password)

    if([username, email, password].some((field)=> field?.trim()==="")){
        res.status(400); throw new Error("All fields must be filled")
    }

    const existingUser = await User.findOne({
        $or: [{username, email}]
    })

    if(existingUser){
        res.status(409); throw new Error("User already exists")
    }
    console.log(req.files)
   const localProfileImagePath = req.files?.profileImage[0]?.path;
   console.log(localProfileImagePath)
   const localCoverImagePath = req.files?.coverImage[0]?.path;

   if(!localProfileImagePath){
    res.status(400); throw new Error("Profile Image is required")
   }


   const profileImage =  await uploadCloudinary(localProfileImagePath)
   const coverImage = await uploadCloudinary(localCoverImagePath)

   if(!profileImage){
    res.status(400); throw new Error("Profile Image is required")
   }
   console.log(username, email,profileImage,coverImage,password)

   const user = await User.create({
        username: username.toLowerCase(), 
        email, 
        profileImage:profileImage.url, 
        coverImage:coverImage?.url || "",
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
    console.log(accessToken, refreshToken)


    const LoggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }


    return res.
            status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(LoggedInUser + accessToken +refreshToken +"User logged in successfully")
})

const logoutUser=asyncHandler(async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
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

export { registerUser,loginUser,logoutUser}