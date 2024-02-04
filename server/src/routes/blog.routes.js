import express from "express";
import { verifyJwt } from "../middlewares/auth.middelware.js";
import { createBlog, deleteBlog, getAllBlogs, getBlog, getCurrentUserBlogs, updateBlog } from "../controllers/blog.controller.js";
import { getBlogLikeStatusOfLoggedInUser, likeUnlikeBlog } from "../controllers/like.controller.js";
import { addComment, deleteComment, getBlogComments, updateComment } from "../controllers/comment.controller.js";
const router = express.Router();

//Blogs Routes
router.route("/create").post(verifyJwt,createBlog)
router.route("/userBlogs").get(verifyJwt,getCurrentUserBlogs)
router.route("/update/:blogId").patch(verifyJwt,updateBlog)
router.route("/allBlogs").get(getAllBlogs)
router.route("/allBlogs/:blogId").get(verifyJwt,getBlog)
router.route("/currrent-blog/:blogId").delete(verifyJwt,deleteBlog)

//Likes Routes
router.route("/currrent-blog/:blogId").patch(verifyJwt,likeUnlikeBlog)
router.route("/currrent-blog/:blogId").get(verifyJwt,getBlogLikeStatusOfLoggedInUser)

//Comments Routes
router.route("/currrent-blog/:blogId/add-comment").post(verifyJwt,addComment)
router.route("/currrent-blog/:blogId/comments").get(verifyJwt,getBlogComments)
router.route("/currrent-blog/:blogId/comments/:commentId").patch(verifyJwt,updateComment)
router.route("/currrent-blog/:blogId/comments/:commentId").delete(verifyJwt,deleteComment)





export default router