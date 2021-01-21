//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var lod = require('lodash');
const Data = require('./data');
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const facebookStrategy = require('passport-facebook').Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate');
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
cartdata = [];
// --------------connection to database --------------------------------------------
mongoose.connect("", { useUnifiedTopology: true }, { useNewUrlParser: true });
const userSchema = new mongoose.Schema({

  name: String,
  firstname: String,
  lastname: String,
  email: String,
  cart: [String]
});
const userAddress = new mongoose.Schema({

  Email: String,
  Address: String,
  State: String,
  City: String,
  Pin: Number
});

userSchema.plugin(findOrCreate);
const User = mongoose.model("Userlogindata", userSchema);
const Userad = mongoose.model("Useradd", userAddress);



// -------------------------loggin credentials----------------------
app.use(passport.initialize());
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

passport.serializeUser(function (user, done)
{
  done(null, user.id);
});

passport.deserializeUser(function (id, done)
{
  // User.findById(id, function (err, user)
  // {
  //   done(err, user);
  // });
});
var name = "";
var emails = "";

// --------------------------Google login start-----------------------------
{
  passport.use(new GoogleStrategy({
    clientID: "",
    clientSecret: "",
    callbackURL: "https://protected-plains-01394.herokuapp.com/auth/google/callback"
  },
    function (accessToken, refreshToken, profile, cb)
    {
      name = profile.name.givenName;


      emails = profile.emails[0].value;
      User.findOrCreate({
        name: profile.displayName,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        email: emails
      })
      // const datag = new User({
      //   name: profile.displayName,
      //   firstname: profile.name.givenName,
      //   lastname: profile.name.familyName,
      //   email: profile.emails[0].value
      // })
      // datag.save();
      return cb(null, profile);
    }
  ));

  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/logins', successRedirect: "/" }),
  );
}
// ------------------------google loginnnn endd---------------------------

// ----------------facebooook loginnnn--------------------------------------
passport.use(new facebookStrategy({

  // pull in our app id and secret from our auth.js file
  clientID: "",
  clientSecret: "",
  callbackURL: "https://protected-plains-01394.herokuapp.com/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'name', 'gender', 'email']

},// facebook will send back the token and profile
  function (token, refreshToken, profile, done)
  {

    name = profile.name.givenName;

    emails = profile.emails[0].value;
    User.findOrCreate({
      name: profile.displayName,
      firstname: profile.name.givenName,
      lastname: profile.name.familyName,
      email: profile.emails[0].value
    })
    // const data1 = new User({
    // name: profile.displayName,
    // firstname: profile.name.givenName,
    // lastname: profile.name.familyName,
    // email: profile.emails[0].value
    // });
    // data1.save();
    return done(null, profile)
  }));


app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email,user_photos' }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/',
    successRedirect: "/"
  }));


// ------------------facebook login enddd-------------------------------------

app.get("/", function (req, res)
{
  if (name.length === 0)
  {
    res.render("home", { signin: "SIGN IN" });
  }
  else
  {
    res.render("home", { signin: ("Hello " + name) })
  }

})

app.get("/about", (req, res) =>
{
  res.render("about");
})

app.get("/women", (req, res) =>
{
  res.render("women");
})

app.get("/men", (req, res) =>
{
  res.render("men");
})

app.get("/signin", (req, res) =>
{
  res.render("signin");
})

app.get("/displaypage", (req, res) =>
{
  res.render("displaypage");
})

app.get("/men/:menon", (req, res) =>
{
  Data.forEach((search) =>
  {
    if (req.params.menon === search.id)
    {
      res.render("displaypage", { img: search.imageadd1, img1: search.imageadd2, itemname: search.name, no: search.id });
    }
  })
})
app.get("/women/:menon", (req, res) =>
{
  Data.forEach((search) =>
  {
    if (req.params.menon === search.id)
    {
      res.render("displaypage", { img: search.imageadd1, img1: search.imageadd2, itemname: search.name, no: search.id });
    }
  })
});

cartid = [];
app.get("/cart/:p/:no", (req, res) =>
{

  if (name.length === 0)
  {
    res.redirect("/signin");
  }
  else
  {

    cartid.push(req.params.no);
    Data.forEach((h =>
    {
      if (h.id === req.params.no)
      {
        cartdata.push(h);
      }
    }
    ));
    if (req.params.p === "h")
    {
      res.redirect("/");
    }
    else if (req.params.p === "m")
    {
      res.redirect("/men");
    }
    else if (req.params.p === "w")
    {
      res.redirect("/women");
    }
    else if (req.params.p === "c")
    {
      res.redirect("/cart");
    }
  }
});



app.get("/cart", (req, res) =>
{
  if (name.length === 0)
  {
    res.redirect("signin");
  }
  else
  {
    res.render("cart", { data: cartdata });
  }
});

app.get("/checkout", (req, res) =>
{
  User.updateOne({ email: emails }, { cart: cartid }, (err, doc) =>
  {
    err ? console.log(err) : console.log(doc);
  });
  res.render("checkout", { name: name });
});

var address = "";
var city = "";
var state = "";
var pin = "";
app.post("/", (req, res) =>
{
  address = req.body.Address;
  states = req.body.State;
  citys = req.body.city;
  pins = req.body.pin;

  var dataadd = new Userad({
    Email: emails,
    Address: req.body.Address,
    State: req.body.State,
    City: req.body.city,
    Pin: req.body.pin

  })
  dataadd.save();
  res.redirect("/finalpage");

});
app.get("/finalpage", (req, res) =>
{
  res.render("finalpage", { name: name, add: address, state: states, city: citys, pin: pins })
})




app.listen(process.env.PORT || 3000, function ()
{
  console.log("Server started on port 3000");
});
