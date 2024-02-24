import { Blog } from "../models/blog.model.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asynchandler.js";


const addComment =asyncHandler(async(req,res)=>{
    const blogId = req.params?.blogId;
    console.log(blogId);
    
    const userId = req.user?._id;
    console.log(userId);
    const {content} = req.body;
    console.log(req.body);
    const blog = await Blog.findById(blogId);

    if(!blog){
        return res.status(404).json("Blog not found")
    }

    const newComment = await Comment.create({
        blog: blogId,
        content: content,
        commentBy:userId,
    })
    await Blog.findByIdAndUpdate(blogId,
        {
            $inc:{
                commentsCount : 1
            }
        },
        {new: true}
    );
       return res.status(200).json({sucess: true, data: newComment,message:"Comment created successfully"})

})

const getBlogComments = asyncHandler(async(req,res)=>{
    const blogId = req.params?.blogId;

    const blog = await Blog.findById(blogId);

    if(!blog){
        return res.status(404).json("Blog not found")
    }

    const allComments = await Comment.find({blog: blogId}).populate({path:"commentBy", select:"userName fullName profileImage"}).sort({createdAt:-1})
    // console.log(allComments)
                            

    return res.status(200).json({sucess:true, data:allComments})

});

const updateComment = asyncHandler(async(req,res)=>{
    const blogId = req.params?.blogId;
    const commentId = req.params?.commentId;
    const currentUser = req.user._id;
    const {content} = req.body;
    const blog = await Blog.findById(blogId);

    if(!blog){
        return res.status(404).json("Blog not found")
    }

    const ExistComment = await Comment.findOne({_id: commentId})
    console.log(ExistComment.commentBy.toString() === currentUser.toString())
    console.log(currentUser)
    if(!ExistComment){
        return res.status(404).json("Comment Not Found")
    }
    if(!(ExistComment.commentBy.toString() === currentUser.toString())){
        return res.status(401).json("Unauthorized request")
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
            {
                $set:{
                    content:content
                }
            },
            {
                new:true
            }
        )

        return res.status(200).json({sucess : true, data:updatedComment, message: 'Updated Comment successfully'})

});

const deleteComment =asyncHandler(async(req,res) => {
    const blogId = req.params?.blogId;
    const commentId = req.params?.commentId;
    const currentUser = req.user._id;
    console.log(commentId)

    const blog = await Blog.findById(blogId);

    if(!blog){
        return res.status(404).json("Blog not found")
    }

    const ExistComment = await Comment.findOne({_id: commentId})

    if(!ExistComment){
        return res.status(404).json("Comment Not Found")
    }
    if(!(ExistComment.commentBy.toString() === currentUser.toString())){
        return res.status(401).json("Unauthorized request")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)
    await Blog.findByIdAndUpdate(blogId,
        {
            $inc:{
                commentsCount : -1
            }
        },
        {new: true}
    );

    if(!deletedComment){
        res.status(400).json("Something went wrong while deleting comment")
    }
    return res.status(200).json({message:"Comment deleted successfully",sucess:true})
});

export {addComment,getBlogComments,updateComment,deleteComment}