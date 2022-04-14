const express = require("express")
const router = express.Router()


//@route            GET api/posts
//@description      Test route
//@access           Public - for getting tokens to access specific routes
router.get("/", () => res.send("Posts route"))

module.exports = router