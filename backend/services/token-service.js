
const jwt=require('jsonwebtoken');
const refreshModel = require('../models/refresh-model');
const accessTokenSecret=process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret=process.env.JWT_REFRESH_TOKEN_SECRET;

const generateTokens=async(payload)=>{
    const accessToken =await jwt.sign(payload,accessTokenSecret,{
        expiresIn:'1h'//valid for 1 hour
    })
    const refreshToken =await jwt.sign(payload,refreshTokenSecret,{
        expiresIn:'1y'//valid for 1 year
    })
    return {accessToken,refreshToken}
}

const storeRefreshToken=async(token,userId)=>{
 try{
    refreshModel.create({
        token,
        userId,
    })

 }catch(error){
    console.log(error.message)
 }
}

const verifyAccessToken=async(token)=>{
    return jwt.verify(token,accessTokenSecret);
}



module.exports={
generateTokens,
verifyAccessToken,
storeRefreshToken
}