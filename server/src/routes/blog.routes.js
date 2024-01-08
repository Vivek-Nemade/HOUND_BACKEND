import express from "express";
import { verifyJwt } from "../middlewares/auth.middelware.js";
import { createBlog, getAllBlogs, getBlog, getCurrentUserBlogs, updateBlog } from "../controllers/blog.controller.js";
const router = express.Router();

router.route("/create").post(verifyJwt,createBlog)
router.route("/userBlogs").get(verifyJwt,getCurrentUserBlogs)
router.route("/update/:blogId").patch(verifyJwt,updateBlog)
router.route("/allBlogs").get(getAllBlogs)
router.route("/allBlogs/:blogId").get(verifyJwt,getBlog)





export default router