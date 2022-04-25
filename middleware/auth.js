// const jwt = require("jsonwebtoken")
// const config = require("config")
// // middle ware are functions that have access to the req and res objects while next is a call back that is called leter to move on to next piece of middleware
// module.exports = function(req,res,next){ // 
//     //get token from header
//     const token = req.header('x-auth-token') //headers have key value pairs hence(x-auth-token) is the key and the token is the value

//     //check if no token
//     if(!token){
//         return res.status(401).json({msg : "No Token, authorization denied!"})
//     }

//     //verify token
//     try {
//         const decoded = jwt.verify(token, config.get("jwtSectret"));

//         req.user = decoded.user;
//         next();

//     } catch (err) {
//         res.status(401).json({msg : "Token is not valid"});
        
//     }

// }

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: 'Token is not valid' });
      } else {
        req.user = decoded.user; //setting request.user to the user in the token with the id in the payload
        console.log(req.user);
        
        next();
      }
    });
  } catch (err) {
    console.error('something wrong with auth middleware');
    res.status(500).json({ msg: 'Server Error' });
  }
};