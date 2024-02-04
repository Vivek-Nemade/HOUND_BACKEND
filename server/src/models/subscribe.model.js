import { Schema,model } from 'mongoose';


const subscribeSchema = new Schema({
    follower:{
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    following:{
        type: Schema.Types.ObjectId,
        ref : 'User'
    },

}, { timestamps: true })


export const Subscribe =model("Subscribe", subscribeSchema)