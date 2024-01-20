import { Schema,model } from 'mongoose';


const likeSchema = new Schema({
    blog: {
        type: Schema.Types.ObjectId,
        ref: "Blog"
    },
    // comment: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Comment"
    // },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    isLiked:{
        type: Boolean,
        default: false
    }
    
}, {timestamps: true})


export const Like =model("Like", likeSchema)