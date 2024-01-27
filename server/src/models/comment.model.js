import { Schema,model } from 'mongoose';

const commentSchema = new Schema({
    blog: {
        type: Schema.Types.ObjectId,
        ref: "Blog"
    },
    content: {
        type: String,
        required : true
    },
    commentBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
    
}, {timestamps: true})


export const Comment =model("Comment", commentSchema)