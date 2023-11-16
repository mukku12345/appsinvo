const { isObjectIdOrHexString } = require("mongoose");

const mongoose = require("mongoose")
module.exports = mongoose=>{
    const user = mongoose.Schema({
        name: String,
        email: String,
        password: String,
        address: String,
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180,
        },
        status: {
            type: String,
            default: 'active',
        },
    register_at: {
            type: Date,
            default: Date.now,
        },
    },
 
    
    
    );
    

    const User = mongoose.model("User",user);
   
    return {User}
    
}