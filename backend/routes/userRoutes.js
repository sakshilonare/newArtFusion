const express= require("express")
const router= express.Router()
// const usersController = require('../controllers/usersController')
const User= require("../models/User")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const requireAuth=require("../middlewares/auth")
const requireAuth=require("../middlewares/requireAuth")
const { OAuth2Client } = require('google-auth-library');

  const CLIENT_ID = '965232707450-80aq2nftg7ea2iusqjo2kqqv0q6pl57k.apps.googleusercontent.com';
  const client = new OAuth2Client(CLIENT_ID);

//using asynch
router.post('/register',async (req,res) => {
    const {name, email, pass,cpass,user_Desc,ph_n} = req.body;
    
    if(!name || !email || !pass || !cpass){
        return res.status(422).json({error:"Please enter all fields"});
    } 

    try{
        const userExist = await User.findOne({email : email});
            if(userExist){
                return res.status(422).json({error : "Email exists"});
            }else if(pass!=cpass){
                return res.status(422).json({error : "password doesnt match"});
            }
            else{
                
                const hashedPwd = await bcrypt.hash(pass, 10) // salt rounds
                const user=new User({name, email, pass: hashedPwd,cpass : hashedPwd,User_desc:user_Desc,Phone_no:ph_n})
                //pwd hashing ^
               const userReg = await user.save();
            
                if(userReg){
                    res.status(201).json({
                        _id: userReg.id,
                        name: userReg.name,
                        email: userReg.email,
                        token: generateToken(userReg._id)
                    });
                }else{
                    res.status(500).json({error:"Failed to register"});
                }
            }
    }catch(err){
        console.log(err);
    }

});

//login route
router.post('/login', async (req, res) => {
    try {
        const { email, pass } = req.body;
        console.log(email);
        console.log(pass);
        if (!email || !pass) {
            return res.status(400).json({ error: "Fill data" });
        }

        const userLogin = await User.findOne({ email: email });
        //console.log("hello rucha!");
        console.log(userLogin);

        if (userLogin) {
            const isMatch = await bcrypt.compare(pass, userLogin.pass); // Ensure 'pass' is the plain text password provided by the user.

            if (!isMatch) {
                res.status(400).json({ error: "Invalid Credentials" });
            } else {
                const token = generateToken(userLogin._id);

                // Log the token on the server
                console.log("Generated Token:", token);
               
               
res.cookie("artToken", token, {
    expires: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    httpOnly: true    
});
                 res.json({
                    _id: userLogin.id,
                    name: userLogin.name,
                    email: userLogin.email,
                    token: token,
                  });

                 

                 
            }
        } else {
            res.status(400).json({ error: "Invalid Credentials" });
        }
    } catch (err) {
        console.log(err);
    }
});

router.get('/dashboard', requireAuth ,(req,res)=>{
    console.log("Hi from dashboard");
})

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
  }
  
  
  
  router.post('/google-login', async (req, res) => {
    const { idToken } = req.body;
  
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      console.log("Payload", payload);
      const userId = payload['sub']; // The user's Google ID
  
      let user = await User.findOne({ googleId: userId });
  
      if (!user) {
        // If the user doesn't exist, create a new user in your database
        if (payload && payload['name'] && payload['email']) {
          user = new User({
            googleId: userId,
            name: payload['name'], // Set the name based on the payload
            email: payload['email'], // Set the email based on the payload
          });
  
          const userReg = await user.save();
          if (!userReg) {
            return res.status(500).json({ error: 'Failed to register user' });
          }
  
          const token = generateToken(userReg._id); // Generate a token
          res.json({
            _id: userReg.id,
            name: userReg.name,
            email: userReg.email,
            token: generateToken(userReg._id),
          });
        } else {
          return res.status(401).json({ error: 'Invalid Google data' });
        }
      }
  
        const token = generateToken(user._id);
      return res.json({ token });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Invalid Google token or data' });
    }
  });
  



//PUT
router.put('/api/updateUser/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const updatedUserData = req.body; // Contains the updated user information
  
      // Update the user information in the database (assuming you have a User model)
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        updatedUserData,
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      return res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user information:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });


// router.get('/tokens', auth, (req, res) => {
//     // The 'auth' middleware ensures the user is authenticated
//     res.json({ tokens: req.user.tokens });
//   });

router.get('/userdetails/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userDetails = await User.findById(userId);

        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(userDetails);
    } catch (error) { // Add the 'error' parameter here
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports=router;