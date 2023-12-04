const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

//defining user schema
const userSchema = new mongoose.Schema({
    nickname:{
        type: String,
        //if no username entered, returns string
        required:[true, 'Please enter a nickname']
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
    },
    status:{
      type: String,
      default: 'enabled'
    },
    verificiation:{
      type: String,
      default: 'unverified'
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

// static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw Error('incorrect password');
    }
    throw Error('incorrect email');
  };

  //method to update password
  userSchema.statics.updatePassword = async function (email, newPassword) {
    try {
      const user = await this.findOne({email});
      if (!user) {
        throw new Error('User not found');
      }
  
      // Update the password
      user.password = newPassword;
      await user.save();
  
      return user;
    } catch (error) {
      throw error;
    }
  };

  //function to find all admins
  userSchema.statics.findAdminUsers = async function () {
    try {
      const adminEmails = await this.find({ status: 'Admin' }).select('email');
      return adminEmails.map(user => user.email);
    } catch (error) {
      console.error('Error finding admin emails:', error);
      throw error; 
    }
  };

//defining user model
const User = mongoose.model('user', userSchema);

module.exports = User;