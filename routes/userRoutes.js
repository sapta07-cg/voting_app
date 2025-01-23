const express=require('express');
const router=express.Router();
const User=require('../models/userModel');
const {jwtAuthMiddleware,generateToken}= require('../middlewares/jwt')

// POST a route to add a person

router.post('/signup',async (req,res)=>{
    try{
        
        const data=req.body; // Assuming req body contains user data

        const adminUser= await User.findOne({role:'admin'});

        if(data.role==='admin' && adminUser) return res.status(400).json({message:"Admin user already exists"})

        const newUser= new User(data); // create a new user doucment using mongoose model

        const response= await newUser.save();  // save the new user to the database

        console.log('data saved');
        const payload={
            id: response.id,
        }

        const token=generateToken(payload);
        res.status(200).json({msg:'success',data:response,token:token});

    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})
    }
})

// Login route

router.post('/login',async (req,res)=>{
    try{
        //Extract aadharCardNumber and password from req body
        const {aadharCardNumber, password}=req.body;

        //Find user by aadharCardNumber
        const user=await User.findOne({aadharCardNumber: aadharCardNumber})

        // Check password and user exist or not

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({message:'Invalid username or password'})
        }

        const payload={
            id:user.id,
        }

        const token=generateToken(payload);
        res.json({token});

    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})

    }

})

// Profile route

router.get('/profile',jwtAuthMiddleware,async (req,res)=>{
    try{
        const userData=req.user;
        const user= await User.findById(userData.id);

        res.status(200).json({user});

    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})

    }

})

// change password in profile route

router.put('/profile/password',jwtAuthMiddleware,async (req,res)=>{
    try{
        const userId=req.user.id; // Extract the id from the token
        const {currentPassword, newPassword}=req.body;  // Extract current and new password from req body

        // Check password  exist or not
        const user= await User.findById(userId);
        
        //if password does not match then return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({message:'Invalid username or password'})
        }

        // update the user's password

        user.password= newPassword;
        await User.save();

        console.log("password updated");
        return res.status(200).json({message:"pssword updated"})
        


    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})


    }
})

module.exports=router;
