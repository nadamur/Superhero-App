const {Router} = require('express');
const router = Router();
const cors = require('cors');

const User = require("./user.js");

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');

router.use(cookieParser());
router.use(bodyParser.urlencoded({extended:true}));

router.use(session({
  key: "jwt",
  secret: 'test secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 60 * 60 *24,
  },
}))

//functions
//handle errors
const handleErrors = (err) => {
    let errors = { nickname: '', email: '', password: '', status: '', verification: '' };
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

//authentication
//creates new user in database
router.post('/signup', async (req, res) => {
  const { nickname, email, password } = req.body;
  try {
    const user = await User.create({ nickname, email, password });
    const id = user._id;
    const token = jwt.sign({id}, 'test secret', {
      expiresIn: 300,
    });
    req.session.user = user;
    //res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge});
    res.status(200).json({ auth: true, token: token, user: user });
  }
  catch(err) {
    const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({errors});
  }
});

//checks for user in database
router.post('/login', async (req,res) =>{
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const id = user._id;
    const token = jwt.sign({id}, 'test secret', {
      expiresIn: 3000,
    })
    req.session.user = user;
    res.status(200).json({ auth: true, token: token, user: user });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
});

//checks whether user is logged in
router.get("/login", (req,res) =>{
  if (req.session.user){
    res.send({loggedIn: true, user: req.session.user})
  }else{
    res.send({loggedIn: false})
  }
});

//log out
router.get('/logout', (req,res)=>{
  console.log("clearing token from backend");
  //delete cookie
  res.clearCookie('jwt');
  res.status(200).json({message: "Deleted successfully"});
})


//middleware
const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  //check token exists and is verified
  if (token) {
    jwt.verify(token, 'test secret', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        return res.status(401).json({ auth: false, message: "Authentication failed" }); // Token is not verified
      } else {
        req.jwt = decodedToken.id;
        next(); // Token is verified, proceed to the next middleware
      }
    });
  } else {
    res.status(401).json({ loggedIn: false }); // Token is missing
  }
}

//returns user
router.get("/getUser", verifyJWT, (req,res) =>{
  res.status(200).json({nickname:req.session.user.nickname, email: req.session.user.email});
});

//updates user status
//assuming body will have new status, either 'Admin', 'enabled' or 'disabled' and email
router.put("/updateStatus", async (req,res) =>{
  const {email, newStatus} = req.body;
  try {
    // update user status in the database using the email
    const updatedUser = await User.findOneAndUpdate({ email }, { status: newStatus }, { new: true });

    if (updatedUser) {
      res.status(200).json({ success: true, user: updatedUser });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

//verifies user
router.put("/verifyEmail", async (req,res) =>{
  const email = req.session.user.email;
  console.log('verifying user ' + email);
  try {
    // update user status in the database using the email
    const updatedUser = await User.findOneAndUpdate({ email }, { verification: 'verified' }, { new: true });
    console.log('updated: ' + updatedUser)
    if (updatedUser) {
      res.json({ success: true, user: updatedUser });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

//returns all emails in database
router.get("/users", verifyJWT, async (req,res) =>{
  try{
    const users = await User.find({}, {email:1, status:1, _id:0});
    res.json({users});
  }catch(error){
    console.error('Error fetching emails:', error);
    return [];
  }
});

//updates password
router.put('/updatePassword', async(req,res)=>{
  
  const email = req.session.user.email;
  console.log('email: ' + email);
  const {newPassword} = req.body;
  console.log('new pass: ' + newPassword);
  try {
    const updatedUser = await User.updatePassword(email, newPassword);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//returns admin emails
router.get("/admins", async (req,res) =>{
  try{
    const adminEmails = await User.findAdminUsers();
    res.json({adminEmails});
  }catch{
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//returns deactivated emails
router.get("/deactivated", async (req,res) =>{
  try{
    const disabledEmails = await User.findDeactivatedUsers();
    res.json({disabledEmails});
  }catch{
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//returns unverified emails
router.get("/unverified", async (req,res) =>{
  try{
    const unverifiedEmails = await User.findUnverifiedUsers();
    res.json({unverifiedEmails});
  }catch{
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;