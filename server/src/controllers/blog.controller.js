
import { Blog } from "../models/blog.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

const createBlog = asyncHandler(async(req,res)=>{
    const {title, description,category} = req.body;
    const userId = req.user._id;

    if(!(title || description)){
        res.status(404); throw new Error("all fields are required");
    }

    const blog = await Blog.create({
        title,
        description,
        owner: userId,
        category
    })

    return res.status(200).json({sucess: true, data: blog,message:"Blog created successfully"})
})


const getCurrentUserBlogs = asyncHandler(async(req,res)=>{
    try {
        const userId = req.user._id;
        
        const blogs = await Blog.find({owner: userId})
        return res.status(200).json( blogs)
    } catch (error) {
        return res.json(error.message)
    }

});

const getAllBlogs = asyncHandler(async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const category = req.query.category;
        const filter = category ? { category } : {};

        const blogs = await Blog.find(filter)
        .populate({path:"owner",select:"userName profileImage"})
        .sort({createdAt:-1})
        .skip((page-1)*limit)
        .limit(limit)


        const count = await Blog.countDocuments(filter);
        const totalPages = Math.ceil(count / limit);
        const currentLength = blogs.length;
        // console.log(blogs)
        return res.status(200).json({
            blogs,
            count,
            currentLength,
            totalPages,
            currentPage: page,
        })
    } catch (error) {
        res.json(error.message);
    }
});

// try catch is pending 
const updateBlog = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const blogId =req.params?.blogId;
    const {title , description,category} = req.body;


    const blogOwner = await Blog.findOne({owner: userId});

    if(!blogOwner){
        return res.status(401).json("You are not allowed to update this blog")
    }

    if(!title || !description){
        res.status(400).json("All fields are required")
    }

   const updated_blog = await Blog.findByIdAndUpdate(
            blogId,
        {
            $set:{
                title : title,
                description : description,
                category : category
            }
        },
        {
            new: true
        }
       
    )
    return res.status(200).json({sucess : true, data:updated_blog, message: 'Updated blog successfully'})


});

const getBlog = asyncHandler(async (req, res) => {
    const blogId =req.params?.blogId;
    const blog = await Blog
                       .findById(blogId)
                       .populate({path:"owner",select:"userName fullName profileImage"})

    if(!blog) {
        res.status(404).json("Blog not found")
    }
    // console.log(blog)
    return res.status(200).json(blog)
})

const deleteBlog = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const blogId =req.params?.blogId;


    const blogOwner = await Blog.findOne({owner: userId});

    if(!blogOwner){
        return res.status(401).json("You are not allowed to update this blog")
    }

    const deletedBlog = await Blog.findByIdAndDelete(blogId)
    if(!deletedBlog){
        res.status(400).json("Something went wrong while deleting blog")
    }

    return res.status(200).json("blog deleted successfully")


});




export {createBlog,getCurrentUserBlogs,getAllBlogs,updateBlog,getBlog,deleteBlog}