
import express from "express"
import {upload} from "../middlewares/multer.middleware.js"
import { getUser, loginUser, logoutUser, registerUser, updateUserData, uploadUserimages } from "../controllers/user.controller.js";
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
router.route('/upload-images').post(
    verifyJwt,
    upload.fields([
        { 
            name: "profileImage", 
            maxCount:1
        },
        { 
            name: "coverImage",
            maxCount:1
        }]), 
    uploadUserimages
    )

router.route('/update-account-details/:userId').patch(verifyJwt,updateUserData)
router.route('/current-user').get(verifyJwt,getUser)



        export default router

