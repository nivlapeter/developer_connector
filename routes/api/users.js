const express = require('express');
const router = express.Router(); //to use the express router
const gravatar = require("gravatar")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("config")
const { body, validationResult } = require('express-validator'); //all rules are in the documentation

const User = require("../../models/User")

//@route            POST api/post
//@description      register users
//@access           Public - for getting tokens to access specific routes
router.post(
  '/',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    //console.log(req.body); // access data in the body

    const errors = validationResult(req);
    if (!errors.isEmpty()) { //checks if there are errors
      
      return res.status(400).json({ errors: errors.array() }); //gets the status and sets a json response
    }
    const { name, email, password } = req.body; //destructuring

    try {
      // see if the user exists
      let user = await User.findOne({ email }) //query
      
      if(user){
        return res.status(400).json({errors:[{msg : "User already exists"}]}) // use the return if not the final res.status/res.json
      }

      //get user gravatar
      const avatar = gravatar.url(email, {
        s : "200", //default size
        r : "pg",
        d : "mm" //default user icon
            })

      user = new User({ //instance of a user
        name,
        email,
        avatar,
        password
      })

      //Encrypt password bcrypt
      const salt = await bcrypt.genSalt(10)//does the password harshing passing in the rounds (10) for security

      user.password = await bcrypt.hash(password, salt) //creates a hash and puts it into the user.password instance

      await user.save() //await comes before anything that returns a promise, saves the user to the DB


      //return JWT
      const payload = { //get payload ,send the users id in the  payload with the token to identify the user
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

module.exports = router;
