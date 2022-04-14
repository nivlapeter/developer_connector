const express = require("express")
const request = require("request")
const config = require("config")
const router = express.Router()
const auth = require("../../middleware/auth")
const { body, validationResult } = require('express-validator');

const Profile = require("../../models/Profile")
const User = require("../../models/User")


//@route            GET api/profile/me
//@description      Get current users profile
//@access           Private - for getting tokens to access specific routes
router.get("/me", auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id}).populate("user", ["name", "avatar"])

        if(!profile){
            return res.status(400).send("Profile not found")
        }
        res.json(profile)
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send("server error")  
    }

})

//@route            GET api/profile
//@description      Get current users profile
//@access           Private - for getting tokens to access specific routes
router.post("/",
[
    auth,[
        body("status", "Status is required").not().isEmpty(),
        body("skills", "Skills is required").not().isEmpty()
    ]
],
async(req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //checks if there are errors
      return res.status(400).json({ errors: errors.array() }); //gets the status and sets a json response
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    //Build profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) {
        profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    // console.log(profileFields.skills);
    // res.send("Hello")

    //build social object
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(facebook) profileFields.social.facebook = facebook;
    if(twitter) profileFields.social.twitter = twitter;
    if(instagram) profileFields.social.instagram = instagram;
    if(linkedin) profileFields.social.linkedin = linkedin;

try {
    let profile = await Profile.findOne({user : req.user.id}) //mongoose methods return a promise

    if(profile){
        //update
        profile = await Profile.findOneAndUpdate(
            {user: req.user.id},
            {$set: profileFields},
            {new: true}
        )
        return res.json(profile)
    }

    //create
    profile = new Profile(profileFields) //creating an instance profie from the model

    await profile.save() // save profile
    res.json(profile)
    
} catch (err) {
    console.log(err.message);
    res.status(500).send("server error")
    
    
}
    
})
//@route            GET api/profile
//@description      Get all profiles
//@access           Public
router.get("/", async(req,res) => {
    try {
        const profiles = await Profile.find().populate("user",["name","avatar"])
        res.json(profiles)
        
    } catch ( err) {
        console.log(err.message);
        res.status(500).send("server error")
        
        
    }
})

//@route            GET api/profile/user/:user_id
//@description      Get profile by user Id
//@access           Public
router.get("/user/:user_id", async(req,res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate("user",["name","avatar"]) // id comes from the url

    if(!profile) 
    return res.status(400).json({msg: "Profile not found"})
    res.json(profile)
        
    } catch ( err) {
        console.log(err.message);
        if(err.kind == "ObjectId"){ //certain kind of error
            return res.status(400).json({msg: "Profile not found"})
        }
        res.status(500).send("server error")
        
        
    }
})

//@route            DELETE api/profile
//@description      DELETE profile, user & posts
//@access           Private
router.delete("/", auth, async(req,res) => {
    try {
        // @todo - remove users posts

        //Remove Profile
        await Profile.findOneAndRemove({user : req.user.id})

        //Remove user
        await User.findOneAndRemove({_id: req.user.id}) //_id field in the user model
        res.json({msg : "User Deleted"})
        
    } catch ( err) {
        console.log(err.message);
        res.status(500).send("server error")
        
        
    }
})

//@route            PUT api/profile/experirnce
//@description      Add profile experience
//@access           Private
router.put("/experience", [auth, [
    body("title", "Title is required").not().isEmpty(),
    body("company", "Company is required").not().isEmpty(),
    body("from", "From is required").not().isEmpty(),
]], async(req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body; //get from the front end

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } // new object with data that the user submits

    try {
        const profile = await Profile.findOne({user : req.user.id}) //id from the token
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile)
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error")
        
        
    }
})

//@route            DELETE api/profile/experirnce/:exp_id
//@description      Delete experience from profile 
//@access           Private
router.delete("/experience/:exp_id", auth, async(req,res)=>{
    try {
        const profile = await Profile.findOne({user : req.user.id}) //get logged in user profile

        //Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)

        await profile.save();

        res.json(profile)
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error")
        
    }
})

//@route            PUT api/profile/education
//@description      Add profile education
//@access           Private
router.put("/education", [auth, [
    body("school", "School is required").not().isEmpty(),
    body("degree", "Degree is required").not().isEmpty(),
    body("fieldofstudy", "Field Of Study is required").not().isEmpty(),
    body("from", "From is required").not().isEmpty()
]], async(req, res) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const{
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body; //get from the front end

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } // new object with data that the user submits

    try {
        const profile = await Profile.findOne({user : req.user.id}) //id from the token
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile)
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error")
        
        
    }
})

//@route            DELETE api/profile/education/:edu_id
//@description      Delete education from profile 
//@access           Private
router.delete("/education/:edu_id", auth, async(req,res)=>{
    try {
        const profile = await Profile.findOne({user : req.user.id}) //get logged in user profile

        //Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1)

        await profile.save();

        res.json(profile)
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error")
        
    }
})

//@route            GET api/profile/github/:username
//@description      Get user repos from Github
//@access           Public
router.get("/github/:username", (req , res) => {
    try {
        const options = {
            uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get("githubClientId")}&client_secret=
            ${config.get("githubSecret")}`,
            method: "GET",
            headers: {"user-agent": "node.js"}
        };

        request(options, (error,response,body) =>{
            if(error) console.error(error);

            if(response.statusCode !== 200){
                return res.status(400).json({msg: "No Github profile found!"});
            }

            res.json(JSON.parse(body))
            

        })
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error")
        
    }
})



module.exports = router