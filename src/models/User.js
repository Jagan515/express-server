const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{type:String},
    email:{type:String,required:true,unique:true},
    password:{type:String},
    googleId:{type:String,required:false},
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
    resetPasswordLastRequestedAt: { type: Date },
    role: { type: String, required: true, default: 'admin' },
    adminId:{type:mongoose.Schema.Types.ObjectId,ref:'User',index:true},
    //Default to 1 to give trail of creating 1 group
    credits:{type:Number,default:1}

});


module.exports =mongoose.model('User',userSchema);