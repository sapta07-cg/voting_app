// const asyncHandler=(fn)=>async (req,res,next)=>{  // this function takig a function -- ()=>{async ()=>{}}
//    try{

//     await fn(req,res,next);

//    }catch(err){
//     res.status(err.code || 500).json({
//         success:false,
//         message: err.message
//     })
//    }

// }

const asyncHandler=(requestHandler)=>{
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))

    }

}

export {asyncHandler}

