
import express from "express"
import {upload} from "../middlewares/multer.middleware.js"
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middelware.js";

const router = express.Router();

router.route('/register').post(
    upload.fields([
        { 
            name: "profileImage", 
            maxCount:1
        },
        { 
            name: "coverImage",
            maxCount:1
        }]), registerUser)


router.route('/login').post(loginUser)
router.route('/logout').post(verifyJwt,logoutUser)



        export default router

