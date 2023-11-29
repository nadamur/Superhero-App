const {Router} = require('express');
const router = Router();
const User = require("./user.js");
const jwt = require('jsonwebtoken');

//functions
//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { username: '', email: '', password: '' };
    // incorrect email
    if (err.message === 'incorrect email') {
      errors.email = 'That email is not registered, ';
    }
    // incorrect password
    if (err.message === 'incorrect password') {
      errors.password = 'That password is incorrect, ';
    }
    // duplicate email error
    if (err.code === 11000) {
      errors.email = 'that email is already registered, ';
      return errors;
    }
    // validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
        });
    }
  return errors;
}
const maxAge = 3 * 60 * 60;
//creates token
const createToken = (id) =>{
  return jwt.sign({id}, 'test secret', {
    expiresIn: maxAge
  });
}

//authentication
//creates new user in database
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const user = await User.create({ username, email, password });
      const token = createToken(user._id);
      res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge});
      res.status(201).json({user: user._id});
    }
    catch(err) {
      const errors = handleErrors(err);
      res.status(400).json({errors});
    }
});



module.exports = router;