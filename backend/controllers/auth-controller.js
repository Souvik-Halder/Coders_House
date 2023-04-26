
const { generateOtp, sendBySms } = require('../services/otp-service')
const { hashOtp } = require('../services/hash-service');
const {isValidOtp}=require('../services/otp-service')
const {findUser, createUser}=require('../services/user-service');
const { generateTokens, storeRefreshToken } = require('../services/token-service');
const UserDto=require('../dtos/user-dto');



const sendOtp = async (req, res, next) => {
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({
            message: 'Phone field is required'
        })
    }
    else {

        //Generate Otp
        const otp = await generateOtp();
        //Hash
        const ttl = 1000 * 60 * 2;//2min
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`
        const hash = await hashOtp(data);

        //Send otp
        try {
            // await sendBySms(phone, otp)
             res.status(200).json({
                hash: `${hash}.${expires}`,
                phone,
                otp
            })
        }
        catch (error) {
            console.log(error.message)
            res.status(500).json({ message: 'message sending failed' })
        }




    }
}

const verifyOtp=async(req,res,next)=>{
    const {otp,hash,phone}=req.body
    if(!otp || !hash || !phone){
        res.status(400).json({
            message:"All fields are required"
        })
    }
    const [hashedOtp,expires]=hash.split('.');
    if(Date.now()>expires){
        res.status(400).json({
            message:'Otp expired'
        })
    }
    else{
            const data=`${phone}.${otp}.${expires}`
            const isValid=await isValidOtp(hashedOtp,data);
          
            if(!isValid){
                res.status(400).json({
                    message:'Invalid Otp'
                })
            }
           else{ 
            let user;
       
            try{
                user=await findUser({phone:phone});
                if(!user){
                   user= await createUser({phone:phone});
                }
            }catch(error){
                console.log(error)
                res.status(500).json({
                    message:'Db error'
                })
            }

            // generate token jwt token
          const {accessToken,refreshToken}=await generateTokens({_id:user._id,activated:false});

        //we are storing the access token in the local storage and refresh token in the 
          await  storeRefreshToken(refreshToken,user._id);
        res.cookie('refreshToken',refreshToken,{
            maxAge:1000*60*60*24*30,
            httpOnly:true
        })
        res.cookie('accessToken',accessToken,{
            maxAge:1000*60*60*24*30,
            httpOnly:true
        })


        const userDto=new UserDto(user);//creating the object of the UserDto Class and sending as a response
        res.status(200).json({user:userDto,auth:true})}
    }
}

module.exports = {
    sendOtp,
    verifyOtp
}