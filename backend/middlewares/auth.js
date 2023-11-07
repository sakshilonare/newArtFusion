const jwt=require("jsonwebtoken")
const User=require("../models/User");
const Auth= async (req,res,next) =>{
    try{
        const tokenSite=req.cookies.artToken; //get token
        const verifyTok=jwt.verify(tokenSite,process.env.SECRET)
        
        const rootUser= await User.findOne({_id:verifyTok,"tokens.token" : tokenSite}) //criteria for the token on site to be available in the DB

        if(!rootUser){
            throw new Error("User not found")
        }

        req.tokenSite=tokenSite;
        req.rootUser=rootUser;
        req.userID=rootUser._id;

        next();

    }catch(err){
        res.status(401).send("Unauthorized:No token provided")
        console.log(err);
    }
}
module.exports=Auth;