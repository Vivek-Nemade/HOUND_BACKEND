import { Blog } from "../models/blog.model";
import { Like } from "../models/like.model";
import { asyncHandler } from "../utils/asynchandler";


const likeUnlikeBlog = asyncHandler(async(req,res)=>{
    // const blogId ="cbjhbcbchabc";
    const blogId = req.params?.blogId;
    const userId = req.user?._id;

    const blog = await Blog.findById(blogId);

    if(!blog){
        return res.status(404).json("Blog not found")
    }
    const ExistingLike = await Like.findOne({blogId,userId})
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

export {likeUnlikeBlog}