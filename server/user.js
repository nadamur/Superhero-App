const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

//defining user schema
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        //if no username entered, returns string
        required:[true, 'Please enter a username']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
    }
});

//function will fire before saving user to database
//this will hash the users password before it is entered to the system using salt and bcrypt
userSchema.pre('save', async function (next){
    //generates salt
    const salt = await bcrypt.genSalt();
    //'this' refers to user being created
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


//defining user model
const User = mongoose.model('user', userSchema);

module.exports = User;