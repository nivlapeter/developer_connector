const express = require("express")
const router = express.Router()
const auth = require("../../middleware/auth")
const User = require("../../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const { body, validationResult } = require('express-validator');


//@route            GET api/auth
//@description      Test route
//@access           Public - for getting tokens to access specific routes
router.get("/", auth, async(req,res) => {
    try { // used while making a call to the database
      // if (id.match(/^[0-9a-fA-F]{24}$/)) {
      //   // Yes, it's a valid ObjectId, proceed with `findById` call.
      // }
        const user = await User.findById(req.user.id).select("-password") //-password leaves out the password in the response from the endpoint
        res.json(user)
    } catch (err) {
        console.log(err.message);
        res.status(401).send("Server error")
        
    }
})

//@route            POST api/auth
//@description      authenticate user and get token
//@access           Public - for getting tokens to access specific routes
router.post(
    '/',
    [
      body('email', 'Please include a valid email').isEmail(),
      body(
        'password','Password is required').exists(),
    ],
    async (req, res) => {
      //console.log(req.body); // access data in the body
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        //checks if there are errors
        return res.status(400).json({ errors: errors.array() }); //gets the status and sets a json response
      }
      const { email, password } = req.body; //destructuring
  
      try {
        // see if the user exists
        let user = await User.findOne({ email })
        
        if(!user){
          return res.status(400).json({errors:[{msg : "Invalid Credentials"}]}) // use the return if not the final res.status/res.json
        }
        
        const isMatch = await  bcrypt.compare(password, user.password); // compare takes a plain text password and an encrypted password checking if they are a match

        if(!isMatch){
            return res.status(400).json({errors:[{msg : "Invalid Credentials"}]})
        }
        //return JWT
        const payload = { //get payload
          user :{
            id : user.id //mongoose abstraction _id
          }
        }
  
        jwt.sign(
          payload,
          config.get("jwtSecret"), //pass in the secret
          {expiresIn : 360000}, //expiration time
          (err, token) => {
            if(err) throw err;
            res.json({token})
   
          }
        )
  
        // res.send('User Registered'); //sending data to this route
  
      } catch (err) {
        console.log(err.message);
        res.status(500).send("server error")
        
      }
    }
  );

module.exports = router




