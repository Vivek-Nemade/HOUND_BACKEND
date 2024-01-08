import { User } from './user.model.js'
import { Schema,model } from 'mongoose'

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    // likes:{
    //     type: Number,
    //     default: 0
    // },
    
    owner: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    // comments:[{user:String, text:String}]
},{timestamps: true})





export const Blog = model('Blog', blogSchema)