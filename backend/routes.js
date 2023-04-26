
const router=require('express').Router();
const {sendOtp,verifyOtp}=require('./controllers/auth-controller');


router.route('/send-otp').post(sendOtp)
router.route('/verify-otp').post(verifyOtp)


//export of router
module.exports=router