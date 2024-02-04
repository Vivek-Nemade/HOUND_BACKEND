import { Blog } from "../models/blog.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asynchandler.js";


const likeUnlikeBlog = asyncHandler(async(req,res)=>{
    // const blogId ="cbjhbcbchabc";
    const blogId = req.params?.blogId;
    console.log(req.params);
    console.log(blogId);
    const userId = req.user?._id;

    const blog = await Blog.findById(blogId);
    if(!blog){
        return res.status(404).json("Blog not found")
    }
    const ExistingLike = await Like.findOne({blog:blogId,likedBy:userId})
    if(!ExistingLike){
            await Like.create({
                blog: blogId,
                likedBy: userId,
                isLiked : true
            })
            await Blog.findByIdAndUpdate(blogId,
                {
                    $inc:{
                        totalLikes : 1
                    }
                },
                {new: true}
            );
            res.status(200).json({message:"Like Added successfully",Like: true})
    }else{
            await Like.findByIdAndDelete(ExistingLike._id)
            await Blog.findByIdAndUpdate(blogId,
                {
                    $inc:{
                        totalLikes : -1
                    }
                },
                {new: true}
            );
            res.status(200).json({message:"Like Removed successfully",Like: false})
    }

    
})

const Likedblogs = asyncHandler(async(req,res)=>{
    const user = req.user._id;

    const blogs = await Like.find({likedBy: user}).populate({path:"blog"})

    if(blogs.length ==0){
        res.status(404).json("you have not liked any blogs")
    }

   return res.status(200).json({success:true,blogs,message:"Fetched Liked Blogs successfully"})
})

const getBlogLikeStatusOfLoggedInUser = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const blogId = req.params?.blogId;

    const blog = await Blog.findById(blogId);
    if(!blog){
        return res.status(404).json("Blog not found")
    }

    const ExistingLike = await Like.findOne({blog:blogId,likedBy:userId})
    // console.log(ExistingLike)
    if(ExistingLike===null){
        return res.status(200).json(false)
    }
    // console.log(ExistingLike.isLiked)
    return res.status(200).json(ExistingLike.isLiked)

});
export {likeUnlikeBlog,Likedblogs,getBlogLikeStatusOfLoggedInUser}