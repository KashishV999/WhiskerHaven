require('dotenv').config(); //load environment variables from .env file
const express= require('express');
const app=express();
const port=process.env.PORT || 3000;
const hostname='localhost';
const path=require('path');
const connectDB=require('./config/database'); //connect to the database
const AppError = require("./AppError"); //import AppError class


const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');


// JSON Web Token Setup
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

// Configure its options
let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};



let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log('payload received', jwt_payload);

  if (jwt_payload) {
    // The following will ensure that all routes using
    // passport.authenticate have a req.user._id, req.user.userName, req.user.fullName & req.user.role values
    // that matches the request payload data
    next(null, {
      _id: jwt_payload._id,
      userName: jwt_payload.userName,
      fullName: jwt_payload.fullName,
      role: jwt_payload.role,
    });
  } else {
    next(null, false);
  }
});


// tell passport to use our "strategy"
passport.use(strategy);

// add passport as application-level middleware
app.use(passport.initialize());






const db=require('./config/database'); //import the database connection


//ejs-mate :  ejs-mate is a package that allows us to use partials in ejs -->. npm install ejs-mate
//differnce bw ejs and ejs-mate: ejs-mate allows us to use partials and layouts in ejs
//ejs-mate
const ejsMate=require('ejs-mate');
app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'/views'));



//MIDDLEWARES
//serve static files or assets
app.use(express.static(path.join(__dirname,'/public'))); //serve static files from public directory
app.use(express.urlencoded({extended:true})); //parse urlencoded data
app.use(express.json()); //parse json data
app.use(express.urlencoded({ extended: true }));

//method-override  -> Forms with PUT and DELETE requests
const methodOverride=require('method-override');
app.use(methodOverride('_method'));



// Connect to the database
db.connect()
  .then(() => {
    (async () => {
      const Cat = db.getCatModel();
      const Shelter = db.getShelterModel();

      const catRoutes = require('./routes/catsRoute')(Cat, Shelter);
      const shelterRoutes = require('./routes/shelterRoute')(Cat, Shelter);
      const nestedRoutes = require('./routes/nestedRoutes')(Cat, Shelter);

      const seedShelter = require('./seeds/seedShelters');
      const seedCat = require('./seeds/seedCats');


      if(!await Shelter.findOne()){
        console.log("No shelters found, seeding data...");
        await seedShelter(Shelter);
      }
      if(!await Cat.findOne()){
        console.log("No cats found, seeding data...");
        await seedCat(Cat, Shelter);
      }

// app.get("/api/register", (req,res)=>{
//   res.render("register.ejs");
// })

// app.get("/api/login", (req,res)=>{
//   res.render("login.ejs");
// });


app.post("/api/register", (req,res)=>{
  db
    .registerUser(req.body)
    .then((msg) => {
      //res.json({ message: msg });
      res.redirect('/cats');


    })
    .catch((msg) => {
      res.status(422).json({ message: msg });
    });
})

app.post("/api/login", (req,res)=>{


  db
    .checkUser(req.body)
    .then((user) => {
      let payload = { 
                _id: user._id,
                userName: user.userName,
                fullName: user.fullName,
                role: user.role
            };
            
            let token = jwt.sign(payload, jwtOptions.secretOrKey);

      //res.json({ message: 'login successful', token: token });
      res.redirect("/cats");
    })
    .catch((msg) => {
      res.status(422).json({ message: msg });
    });
});




      app.get("/", (req, res) => {
       // res.render('./cats/index.ejs');
       res.redirect("/cats");
      });

      app.use("/cats", catRoutes);
      app.use("/shelters", shelterRoutes);
      app.use("/shelters/:shelterId/cats", nestedRoutes);








app.get("/admin/cats", async (req,res)=>{
  const cats=await Cat.find({}).populate("shelter");
  res.render("adminDashboard/catsManage.ejs", { cats });
})
app.get("/admin/shelters", async (req,res)=>{ 
const shelters=await Shelter.find({})
  res.render("adminDashboard/sheltersManage.ejs", { shelters });
});









      app.use((req, res) => {
        throw new AppError("Page not found", 404);
      });

      app.use((err, req, res, next) => {
        const { statusCode = 500, message = "Something went wrong" } = err;
        res.status(statusCode).render("error.ejs", { message });
      });

      app.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
    })();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });


