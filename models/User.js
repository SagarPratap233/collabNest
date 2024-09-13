const  mongoose  = require('mongoose');
const  Schema  = mongoose.Schema;  

const  userSchema  = new Schema(
    {
        googleId: {
            type : String, 
            required: true
        }
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;  