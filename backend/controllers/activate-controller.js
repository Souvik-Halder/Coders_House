
const Jimp = require('jimp');
const path=require('path');
const { findUser } = require('../services/user-service');
const UserDto = require('../dtos/user-dto');




const activate=async(req,res,next)=>{
    const{name,avatar}=req.body;
    if(!name || !avatar){
        res.status(400).json({
            message:'All fields are required'
        })
    }
  
 
        // Image  Base64 //Here we are using the regex
        const buffer=Buffer.from(avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/,''),'base64');
        const imagePath=`${Date.now()}-${Math.round(
            Math.random()*1e9
        )}.png`;//This is for generating the image name to store the image in the file
        try{
            const jimResp=await Jimp.read(buffer);
            jimResp.resize(150,Jimp.AUTO).write(path.resolve(__dirname,`../storage/${imagePath}`));//here the width and height is decider
        }catch(error){
           return res.status(500).json({message:'Could not process the image'})
        }
        const userId=req.user._id 
        //update user
      try {
        //find the user in the user-model and need to update the values
        const user= await findUser({_id:userId});
    
        if(!user){
         res.status(404).json({message:"User not found"});
        }
        
         user.activated=true;
         user.name=name;
         user.avatar=`/storage/${imagePath}`;
         user.save();
         
         res.status(200).json({user:new UserDto(user),auth:true})
  
        
      } catch (error) {
        res.status(500).json({message:'Something went wrong'})

      
    }
}

module.exports={ 
    activate
}