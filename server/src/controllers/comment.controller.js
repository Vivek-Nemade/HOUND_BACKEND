import { Blog } from "../models/blog.model.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asynchandler.js";


const addComment =asyncHandler(async(req,res)=>{
    const blogId = req.params?.blogId;
    const userId = req.user?._id;
    const {comment} = req.body;

    const blog = await Blog.findById(blogId);

    if(!blog){
        return res.status(404).json("Blog not found")
    }

    const newComment = await Comment.create({
        blog: blogId,
        content: comment,
        commentBy:userId,
    })
       return res.status(200).json({sucess: true, data: newComment,message:"Comment created successfully"})

})

const getBlogComments = asyncHandler(async(req,res)=>{
    const blogId = req.params?.blogId;

    const blog = await Blog.findById(blogId);

    if(!blog){
        return res.status(404).json("Blog not found")
    }

    const allComments = await Comment.find({blog: blogId}).populate({path:"commentBy", select:"userName"})
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

    if(!deletedComment){
        res.status(400).json("Something went wrong while deleting comment")
    }
    return res.status(200).json("Comment deleted successfully")
});

export {addComment,getBlogComments,updateComment,deleteComment}


// [
//     {
//       $match: {
//         _id: ObjectId("65ad4139d69ac7fc4817e204"),
//       },
//     },
//     {
//       $lookup: {
//         from: 'comments',
//         localField: '_id',
//         foreignField: 'blog',
//         as: 'comments',
//       },
//     },
//     {
//       $unwind: {
//         path: '$comments',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'comments.commentBy',
//         foreignField: '_id',
//         as: 'commentByDetails',
//       },
//     },
//     {
//       $unwind: {
//         path: '$commentByDetails',
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $group: {
//         _id: '$_id',
//         title: { $first: '$title' },
//         description: { $first: '$description' },
//         totalLikes: { $first: '$totalLikes' },
//         owner: { $first: '$owner' },
//         visitedCount: { $first: '$visitedCount' },
//         comments: {
//           $push: {
//             content: '$comments.content',
//             userName :'$commentByDetails.userName',
//             commentByDetails: {
//               _id: '$commentByDetails._id',
//               userName: '$commentByDetails.userName',
//               profileImage:"$commentByDetails.profileImage"
//               // Add other user details as needed
//             },
//             // Add other comment details as needed
//           },
//         },
//       },
//     }
//   ]