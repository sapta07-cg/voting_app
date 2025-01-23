const mongoose= require('mongoose');
require('dotenv').config();

// Define the mongodb connection url

const mongoUrl=process.env.MONGODB_URL_LOCAL // Replace 'hotels' with any database name

//Set up Mongo DB connection

mongoose.connect(mongoUrl) 

//Get the default connection
// Mongoose maintains a default connection object representing the mongodb connection.

const db=mongoose.connection; // using this 'db' we can create bridge between mongodb and node js.

// define event listners for database connection

db.on('connected',()=>{
    console.log('connected to MongoDB server')
})

db.on('error',(err)=>{
    console.log('MongoDB connection error',err)
})

db.on('disconnected',()=>{
    console.log('MongoDB disconnected')
})

//Export the database connection

module.exports=db;



