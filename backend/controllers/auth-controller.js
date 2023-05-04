
const { generateOtp, sendBySms } = require('../services/otp-service')
const { hashOtp } = require('../services/hash-service');
const { isValidOtp } = require('../services/otp-service')
const { findUser, createUser } = require('../services/user-service');
const { generateTokens, storeRefreshToken,verifyRefreshToken, removeToken,findRefreshToken, updateRefreshToken } = require('../services/token-service');
const UserDto = require('../dtos/user-dto');



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

const verifyOtp = async (req, res, next) => {
    const { otp, hash, phone } = req.body
    if (!otp || !hash || !phone) {
        res.status(400).json({
            message: "All fields are required"
        })
    }
    const [hashedOtp, expires] = hash.split('.');
    if (Date.now() > expires) {
        res.status(400).json({
            message: 'Otp expired'
        })
    }
    else {
        const data = `${phone}.${otp}.${expires}`
        const isValid = await isValidOtp(hashedOtp, data);

        if (!isValid) {
            res.status(400).json({
                message: 'Invalid Otp'
            })
        }
        else {
            let user;

            try {
                user = await findUser({ phone: phone });
                if (!user) {
                    user = await createUser({ phone: phone });
                }
            } catch (error) {
                console.log(error)
                res.status(500).json({
                    message: 'Db error'
                })
            }

            // generate token jwt token
            const { accessToken, refreshToken } = await generateTokens({ _id: user._id, activated: false });

            //we are storing the access token in the local storage and refresh token in the 
            await storeRefreshToken(refreshToken, user._id);
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                secure:true,
                httpOnly:true,
              
            })
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                secure:true,
                httpOnly:true
            })


            const userDto = new UserDto(user);//creating the object of the UserDto Class and sending as a response
            res.json({ user: userDto, auth: true })
        }
    }
}
const refresh = async (req, res, next) => {
    //get refresh token from cookie
    const { refreshToken:refreshTokenFromCookie } = req.cookies;
    //check the refresh token is valid or not
    let userData;
    try {
        userData=await verifyRefreshToken(
            refreshTokenFromCookie
        )
    } catch (err) {
       
       return res.status(401).json({message:"Invalid token 2"})
    }
    //check if token is in dataBase
    try{
        const token = await findRefreshToken(userData._id,refreshTokenFromCookie)
        if(!token){
            return res.status(401).json({message:"Invalid Token 1"})
        }
    }catch(error){
        return res.status(500).json({message:"Internal error"})
    }
    //check if valid user
    const user=await findUser({_id:userData._id});
    if(!user){
        return res.status(404).json({message:"No User"})
    }

    //generate new access and refresh token
   const {refreshToken,accessToken} = await generateTokens({_id:userData._id});
    //update refresh token
    try{
       await  updateRefreshToken(userData._id,refreshToken)
    }catch(error){
       return res.status(500).json({message:'Internal error'})
    }
    //put the tokens in the cookie
    res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secure:true,
        httpOnly:true,
    })
    res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secure:true,
        httpOnly:true
    })

    //send the response
    const userDto=new UserDto(user);
    res.json({user:userDto,auth:true});
}
const logout=async(req,res,next)=>{
    const {refreshToken}=req.cookies
//delete refresh token from db
    await removeToken(refreshToken);
//delete cookies
res.clearCookie('refreshToken');
res.clearCookie('accessToken');
res.json({user:null,auth:false});
//response
}
module.exports = {
    sendOtp,
    verifyOtp,
    refresh,
    logout,
}
