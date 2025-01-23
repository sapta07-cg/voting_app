const mongoose=require('mongoose');
// const bcrypt=require('bcrypt');

// Define the Person schema

const candidateSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    party:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    votes:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'User',   // reference table, so data will come from user table
                required: true
            },
            votedAt:{
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount:{
        type: Number,
        default: 0
    }
   
})

//Create candidate model

const Candidate=mongoose.model('Candidate',candidateSchema);

module.exports=Candidate;
