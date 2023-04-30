
const router=require('express').Router();
const { activate } = require('./controllers/activate-controller');
const {sendOtp,verifyOtp,refresh,logout}=require('./controllers/auth-controller');
const { create,index, show } = require('./controllers/rooms-controller');
const authMiddleware = require('./middlewares/auth-middleware');


router.route('/send-otp').post(sendOtp)
router.route('/verify-otp').post(verifyOtp)
router.route('/activate').post(authMiddleware,activate)
router.route('/refresh').get(refresh);
router.route('/logout').post(authMiddleware,logout)
router.route('/rooms').post(authMiddleware,create).get(authMiddleware,index)
router.route('/rooms/:roomId').get(authMiddleware,show)

//export of router
module.exports=router