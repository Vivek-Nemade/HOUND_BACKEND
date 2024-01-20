import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js"
dotenv.config();
const app = express();

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
}));
// app.use(cors())
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


//routes import

import userRoutes from "./routes/user.routes.js"
import blogRoutes from "./routes/blog.routes.js"


app.use("/api/v1/user", userRoutes)
app.use("/api/v1/blog", blogRoutes)

app.get("/", function(req, res){
    res.send("hello world")
})
// tested for setting cookies manually
// app.get('/setcookie', function (req, res) {
//     res.cookie('Token', "exampletoken", {
//         maxAge: 1000 * 60 * 60 * 24 * 30 * 12,
//         httpOnly: true
//     }).send('Success!');
// })

app.listen(process.env.PORT || 8000, async()=>{
    await connectDB();
    console.log(`Server listening on posrt ${process.env.PORT}`);
});