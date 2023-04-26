
const UserModel=require('../models/user-model');

const findUser=async(filter)=>{
    const user=await UserModel.findOne(filter);
    return user;
}
const createUser=async(data)=>{
    const user=await UserModel.create(data);
    return user;
}


module.exports={
    findUser,
    createUser
}