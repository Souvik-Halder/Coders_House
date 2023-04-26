
const crypto=require('crypto')

const hashOtp=async(data)=>{
 return   crypto.createHmac('sha256',process.env.HASH_SECRET).update(data).digest('hex')
}

module.exports={
    hashOtp
}