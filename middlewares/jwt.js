const jwt=require('jsonwebtoken');

require('dotenv').config();

const jwtAuthMiddleware=(req,res,next)=>{

    //first check req headers has authorization or not

    const authorization=req.headers.authorization
    if(!authorization) return res.status(401).json({msg:'token not found'})

    //Extract JWT token from the request header

    const token=authorization.split(' ')[1];

    if(!token) return res.status(401).json({message: 'Unauthorized'})

    try{
        // verify the JWT token
       
        const decoded= jwt.verify(token,process.env.JWT_SECRET); // this returns payload which is provided during creation of token
        
        // Attach user info to the req object

        console.log("decoded value",decoded);

        req.user=decoded;
        next();
    }catch(err){
        console.log(err);
        res.status(401).json({error:'Invalid token'})
    }    
}

// function to generate token

const generateToken=(userData)=>{
    return jwt.sign(userData,process.env.JWT_SECRET,{expiresIn: 6000});
}
module.exports={jwtAuthMiddleware,generateToken};