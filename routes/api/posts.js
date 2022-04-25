const express = require("express")
const router = express.Router();
const {body, validationResult } = require("express-validator");
const auth = require("../../middleware/auth")



const Post = require("../../models/Posts")
const Profile = require("../../models/Profile")
const User = require("../../models/User")


//@route            GET api/posts
//@description      Create a post
//@access           Private - have to be logged in to create a post
router.post("/", [auth,[
    body("text","Text is required!").not().isEmpty()
]], async(req, res) => {
    const errors = validationResult();
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    try {
        const user = await User.findById(req.user.id).select("-password");
    } catch (err) {
        console.log(err.message);
        res.status(500).json("server error")
        
        
    }
   


})

module.exports = router