
//Imports
const crypto=require('crypto')
const smsSid=process.env.SMS_SID
const smsAuthToken=process.env.AUTH_TOKEN
const twilio=require('twilio')(smsSid,smsAuthToken,{
    lazyLoading:true
})
const{hashOtp}=require('./hash-service')
const { truncate } = require('fs')
const generateOtp=async()=>{
    const otp= crypto.randomInt(1000,9999);
    // console.log(otp)
    return otp
}

const sendBySms=async(phone,otp)=>{
    return await twilio.messages.create({
        to:phone,
        from:process.env.SMS_FROM_NUMBER,
        body:`Your codershouse OTP is ${otp}` 
    })

}
const isValidOtp=async(hashedOtp,data)=>{
    let computedHash=await hashOtp(data);

    
    if(computedHash === hashedOtp){
        return true
    }
    else{
        false
    }
}


module.exports={
    generateOtp,
    sendBySms,
    isValidOtp
}