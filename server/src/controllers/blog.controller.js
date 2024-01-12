
import { Blog } from "../models/blog.model.js";
import { asyncHandler } from "../utils/asynchandler.js";

const createBlog = asyncHandler(async(req,res)=>{
    const {title, description} = req.body;
    const userId = req.user._id;

    if(!(title || description)){
        res.status(404); throw new Error("all fields are required");
    }

    const blog = await Blog.create({
        title,
        description,
        owner: userId,
    })

    return res.status(200).json({sucess: true, data: blog,message:"Blog created successfully"})
})


const getCurrentUserBlogs = asyncHandler(async(req,res)=>{
    const userId = req.user._id;

    const blogs = await Blog.find({owner: userId})
    return res.status(200).json( blogs)

});

const getAllBlogs = asyncHandler(async(req,res)=>{
    const blogs = await Blog.find({}).populate({path:"owner",select:"username profileImage"}).limit(10)
    const count = await Blog.countDocuments();
    const currentLength = blogs.length;
    console.log(blogs)
    return res.status(200).json({blogs,count,currentLength})
});

// try catch is pending 
const updateBlog = asyncHandler(async(req,res)=>{
    const userId = req.user._id;
    const blogId =req.params?.blogId;
    const {title , description} = req.body;


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
                description : description
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
    const blog = await Blog.findById(blogId)

    if(!blog) {
        res.status(404).json("Blog not found")
    }
    // console.log(blog)
    return res.status(200).json(blog)
})




export {createBlog,getCurrentUserBlogs,getAllBlogs,updateBlog,getBlog}