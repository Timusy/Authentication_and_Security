//jshint esversion:6
require('dotenv').config();
const express=require("express");
const https=require("https");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
//Installed mongoose-encryption for lev-1 security
// const encrypt=require("mongoose-encryption");
//Installed md5 for lev-2 security
// var md5 = require('md5');
//Installed bcrypt for level3 security and hashing
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
//Installed express-session passport passport-local, passport-local-mongoose,
const session = require('express-session');
const passport= require("passport");
const passportLocalMongoose= require("passport-local-mongoose");


const app=express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
//This code is always placed above mon connection
app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true , useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);
const userSchema=new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User=mongoose.model("User",userSchema);

//console.log(process.env.API_KEY);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
  res.render("home");
});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.post("/register",function(req,res){
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     const newUser=new User({
//       email:req.body.username,
//     //  password:md5(req.body.password)
//     password:hash
//     });
//     newUser.save(function(err){
//       if(err){
//         console.log(err);
//       }
//       else{
//         res.render("secrets");
//       }
//     });
// });
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login",function(req,res){
//   const username=req.body.username;
//   // const password=md5(req.body.password);
//     const password=(req.body.password);
//   User.findOne({email:username},function(err,foundUser){
//     if(err){
//       console.log(err);}
//       else{
//         if(foundUser){
//           // if(foundUser.password==password){
//           //  console.log(foundUser.password);
//           bcrypt.compare(password, foundUser.password, function(err, result) {
//               if(result===true){
//                 res.render("secrets");
//               }
// });
//
//
//         }
//       }
//
//   });

const user=new User({
      username:req.body.username,
      password:req.body.password
    });

    req.login(user,function(err){
      if(err){
        console.log(err);
      }
      else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets");
        });
      }
    });
});

app.listen(3000,function(){
  console.log("Connected to Port 3000");
});
