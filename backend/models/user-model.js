const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        phone: { type: String, required: true },
        name:{type:String,required:false},
        avatar:{type:String,required:false ,get:(avatar)=>{
            if(avatar){
            return `${process.env.BASE_URL}${avatar}`;
        }
        return avatar
            //Here the greater function is used when anyone will put any avatar in the app then 
            //the avatar will be stored in the database after creating the url of that avatar
            //to do that we used here the greater function and to enable that enable the greater function
            //just like the below code
        }},
        activated: { type: Boolean, required: false, default: false },
    },
    {
        timestamps: true,
        toJSON:{getters:true}
    }
);

module.exports = mongoose.model('User', userSchema, 'users');