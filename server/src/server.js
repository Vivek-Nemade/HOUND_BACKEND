import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js"
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());


//routes import

import userRoutes from "./routes/user.routes.js"
import blogRoutes from "./routes/blog.routes.js"


app.use("/api/v1/user", userRoutes)
app.use("/api/v1/blog", blogRoutes)

app.get("/", function(req, res){
    res.send("hello world")
})

app.listen(process.env.PORT || 8080, async()=>{
    await connectDB();
    console.log(`Server listening on posrt ${process.env.PORT}`);
});