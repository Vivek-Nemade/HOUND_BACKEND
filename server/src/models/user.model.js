import jwt from "jsonwebtoken"
import {Schema,model} from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    userId:{
        type: String,
        unique: true,
    },
    username: {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        index: true
    },
    email: {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
    },
    profileImage: {
        type : String,
        required : true,
    },
    coverImage: {
        type : String,
    },
    password: {
        type : String,
        required : [true, 'password is required'],
    },
    refreshToken: {
        type : String,
    }
},{timestamps: true})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generatAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email:this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}
userSchema.methods.generatRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    
    
}
export const User = model('User',userSchema)