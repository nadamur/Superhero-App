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
      errors.email = 'This email is not registered, ';
    }
    // incorrect password
    if (err.message === 'incorrect password') {
      errors.password = 'This password is incorrect, ';
    }
    // duplicate email error
    if (err.code === 11000) {
      errors.email = 'This email is already registered, ';
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

//checks for user in database
router.post('/login', async (req,res) =>{
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge});
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
});



//middleware
const requireAuth = (req,res,next) =>{
  const token = req.cookies.jwt;
  //check token exists and is verified
  if(token){
    jwt.verify(token, 'test secret', (err, decodedToken)=>{
      if(err){
        console.log(err.message);
        res.status(401).json({ error: 'Unauthorized' });
        res.redirect('/');
      }else{
        console.log('decoded token: ' + decodedToken);
        next();
      }
    })
  }else{
    res.redirect('/');
  }
}

//checks authentication status
router.get('/api/check-auth', requireAuth, (req, res) => {
  // If the middleware (requireAuth) is passed, the user is authenticated
  res.json({ isAuthenticated: true });
});


module.exports = router;