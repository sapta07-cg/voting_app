const express=require('express');
const router=express.Router();
const Candidate=require('../models/candidateModel');
const User=require('../models/userModel');
const {jwtAuthMiddleware,generateToken}= require('../middlewares/jwt')

const checkAdminRole=async (userId)=>{
    try{
        const user= await User.findById(userId);
        return user.role==='admin';
    }catch(e){
        return false;
    }

}

// POST a route to add a candidate

router.post('/',jwtAuthMiddleware,async (req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message:'user does not admin role'})
        }
        const data=req.body; // Assuming req body contains candidate data

        const newCandidate= new Candidate(data); // create a new candidate doucment using mongoose model

        const response= await newCandidate.save();  // save the new candidate to the database

        console.log('data saved');
        res.status(200).json({msg:'success',data:response});

    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})
    }
})





router.put('/:candidateID',jwtAuthMiddleware,async (req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message:'user does not admin role'})
        }
        const candidateId=req.params.candidateID;
        console.log("id from Url is ", candidateId);
        const updatedCandidateData=req.body;

        const response= await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData,{
            new:true, // Return the updated document
            runValidators: true // Run Mongoose validation
        });

        if(!response){
            console.log(res)
            return res.status(404).json({msg:'Candidate not found'})
        }

        console.log('data updated');
        res.status(200).json({msg:'success',data:response});
        


    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})


    }
})

router.delete('/:candidateID',jwtAuthMiddleware,async (req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message:'user does not admin role'})
        }
        const candidateId=req.params.candidateID;

        const response= await Candidate.findByIdAndDelete(candidateId,{
            new:true, // Return the updated document
            runValidators: true // Run Mongoose validation
        });

        if(!response){
            console.log(res)
            return res.status(404).json({msg:'Candidate not found'})
        }

        console.log('data updated');
        res.status(200).json({msg:'success',data:response});
        


    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})


    }
})

// start voting

router.post('/vote/:candidateID',jwtAuthMiddleware,async (req,res)=>{
    //no admin can vote
    // user can vote only once

    const candidateId=req.params.candidateID;
    const userId=req.user.id;

    try{
        //Find the cadidate docuemnt with specified candidate id
        const candidate= await Candidate.findById(candidateId);
        
        if(!candidate){
            return res.status(404).json({message:"candidate not found"});
        }
        
        const user= await User.findById(userId);

        if(!user){
            return res.status(404).json({message:"user not found"});
        }
        if(user.isVoted){
            return res.status(400).json({message:"user already voted"});
        }

        if(user.role=='admin'){
            return res.status(403).json({message:"admin is not allowed"});
        }

        // update the candidate to record the vote

        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        // update user document

        user.isVoted=true;
        await user.save();

        res.status(200).json({message:"vote record successfully"});

    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})

    }
})

//vote count
router.get('/vote/counts',async (req,res)=>{
    try{
        const candidate= await Candidate.find().sort({voteCount:'desc'});

        // map the candidate only their party and vote count

        const voteRecord=candidate.map((item)=>{
            return{
                party: item.party,
                count: item.voteCount
            }
        })

        return res.status(200).json(voteRecord)

    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})
    }

})

// list of candidates

router.get('/candidatelist',async (req,res)=>{
    try{
        const candidate= await Candidate.find();

        const candidateList= candidate.map((data)=>{
            return{
                name: data.name,
                age: data.age,
                party: data.party
            }
        })

        return res.status(200).json(candidateList)
        
    }catch(err){
        console.log(err);
        res.status(500).json({msg:'internal server error'})
    }

})

module.exports=router;
