
import express from "express"
import {upload} from "../middlewares/multer.middleware.js"
import { getUser, getUserByParams, loginUser, logoutUser, registerUser, updateUserData, uploadUserimages } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middelware.js";
import { Likedblogs } from "../controllers/like.controller.js";
import { addFollow, getFollowStatus, removeFollower } from "../controllers/subscribe.controller.js";

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

router.route('/update-account-details').patch(verifyJwt,updateUserData)
router.route('/current-user').get(verifyJwt,getUser)
router.route('/userdata/:visitedUser/follow-status').get(verifyJwt,getFollowStatus)
router.route('/userdata/:visitedUser').post(verifyJwt,addFollow)
router.route('/userdata/:visitedUser').delete(verifyJwt,removeFollower)
router.route('/userdata/:userId').get(verifyJwt,getUserByParams)
router.route('/current-user/liked-Blogs').get(verifyJwt,Likedblogs)



        export default router

