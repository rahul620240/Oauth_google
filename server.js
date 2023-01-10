require('dotenv').config()
const express=require('express');
const mongoose=require("mongoose");
mongoose.set('strictQuery', true);
const passport=require("passport");
const findOrCreate = require('mongoose-findorcreate');
const cookieSession=require("cookie-session");

const GoogleStrategy = require('passport-google-oauth20').Strategy;

mongoose.connect("mongodb://localhost:27017/OauthDB",{useUnifiedTopology:true});


const userSchema=new mongoose.Schema({
    googleId:String,
    userName:String,
});

userSchema.plugin(findOrCreate);

const User=new mongoose.model("User",userSchema);

const app=express();


app.use(cookieSession({
    // age of the cookie in milliseconds
       // cookie will last for one day
    maxAge: 24 * 60 * 60 * 1000,
    // encrypts the user id
    keys: [process.env.COOKIE_SECRET],
  }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/redirect"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id ,userName:profile.displayName}, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.serializeUser((user,done)=>{
    done(null,user.id)
});

passport.deserializeUser((id,done)=>{
    User.findById(id).then(user=>{
        done(null,user);
    });
});

app.get("/",function(req,res){
    res.send("welcome");
});

app.get('/auth/google',passport.authenticate("google",{
    scope:["profile","email"],
    prompt:"select_account"
}));

app.get("/auth/google/redirect",passport.authenticate('google'),(req,res)=>{
    res.send(req.user.userName)
});

app.get('/auth/logout',(req,res)=>{
    req.logout();
   req.session=null;

    res.send(req.user);
})

app.listen(3000,(req,res)=>{
console.log("port chal rha hai mast code kr sahi se!!!")
});