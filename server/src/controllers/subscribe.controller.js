
import { Subscribe } from "../models/subscribe.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asynchandler.js";


const getFollowStatus = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const {visitedUser} = req.params
    const existingFollower = await Subscribe.findOne({follower:userId,following:visitedUser});

    if(!existingFollower){
        return res.status(200).json(false)
    }
    return res.status(200).json(true)

})

const addFollow = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const {visitedUser} = req.params
    console.log(visitedUser)

    const existingFollower = await Subscribe.findOne({follower:userId,following:visitedUser});

    if(!existingFollower){
        const addFollower = await Subscribe.create({
            follower:userId,
            following:visitedUser
        })
         await User.findByIdAndUpdate(userId, { $inc : {followingCount: 1}})
         await User.findByIdAndUpdate(visitedUser, { $inc : {followersCount: 1}})

         return res.status(200).json({addFollower,userStatus:true})
    }
    
    return res.status(400).json({ message: 'Already following this user' });
})

const removeFollower = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {visitedUser} = req.params

    const existingFollower = await Subscribe.findOne({follower:userId,following:visitedUser});

    if(existingFollower){
        await Subscribe.findByIdAndDelete(existingFollower)

        await User.findByIdAndUpdate(userId, { $inc : {followingCount: -1}})
        await User.findByIdAndUpdate(visitedUser, { $inc : {followersCount: -1}})

        res.status(200).json({message: 'UnFollowed this user successfully', userStatus:false});
    }

    return res.status(400).json({ message: 'You are not following this user' });
})

const getFollowersAndFollowing = asyncHandler(async (req, res) => {
    const userId = req?.user?._id;

    const followers = await Subscribe.find({following:userId}).select("follower")
                                     .populate({path:"follower"})
    const following = await Subscribe.find({follower:userId}).select("following")
                                    .populate({path:"following"})

    return res.status(200).json({followers,following})

})


export {addFollow,removeFollower,getFollowStatus,getFollowersAndFollowing}