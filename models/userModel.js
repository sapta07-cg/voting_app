const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

// Define the Person schema

const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    mobile:{
        type: String,
    },
    email:{
        type: String,
    },
    address:{
        type: String,
        required: true
    },
    aadharCardNumber:{
        type: Number,
        required:true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type: Boolean,
        default: false
    }
})

userSchema.pre('save', async function(next){
    const user=this; // here this represent every record of Person model


    // Hash the password, if it has been modified (or its new)

    if(!user.isModified('password')) return next();

    try{

        // hash password generation

        const salt= await bcrypt.genSalt(10); // genSalt(round)  --> round parameter indicates the complexity of hashing algorithm

        // hash password

        const hashedPassword= await bcrypt.hash(user.password, salt);
        // override the plain password with hashed password 
        user.password=hashedPassword;

        next();

    }catch(err){
        return next(err);

    }

})

userSchema.methods.comparePassword=async function(candidatePassword){
    try{
        const isMatch= await bcrypt.compare(candidatePassword,this.password)
        return isMatch;

    }catch(e){
        throw e;

    }

}

//Create user model

const User=mongoose.model('User',userSchema);

module.exports=User;
