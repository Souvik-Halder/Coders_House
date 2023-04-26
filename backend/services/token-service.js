
const jwt=require('jsonwebtoken');
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




module.exports={
generateTokens
}