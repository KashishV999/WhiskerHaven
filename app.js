require("dotenv").config(); //load environment variables from .env file
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const hostname = "localhost";
const path = require("path");
const AppError = require("./AppError"); //import AppError class

//method-override  -> Forms with PUT and DELETE requests
const methodOverride = require("method-override");

const db = require("./config/database"); //import the database connection

//ejs-mate :  ejs-mate is a package that allows us to use partials in ejs -->. npm install ejs-mate
//differnce bw ejs and ejs-mate: ejs-mate allows us to use partials and layouts in ejs
//ejs-mate
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "/views"));

//MIDDLEWARES
//serve static files or assets
app.use(express.static(path.join(__dirname, "/public"))); //serve static files from public directory
app.use(express.urlencoded({ extended: true })); //parse urlencoded data
app.use(express.json()); //parse json data
app.use(methodOverride("_method"));

//Authentication
const passport = require("passport");  //passport initialize in app.js as  it tells (Express, use passport for authentication)
const cookieParser = require("cookie-parser");

const {optionalJwtMiddleware, generateToken, isAdmin}  = require("./config/Auth");

app.use(passport.initialize());
app.use(cookieParser());
app.use(optionalJwtMiddleware);




// Connect to the database
db.connect()
  .then(() => {
    (async () => {
      const Cat = db.getCatModel();
      const Shelter = db.getShelterModel();
      const Application = db.getApplicationModel();

      const catRoutes = require("./routes/catsRoute")(Cat, Shelter, Application);
      const shelterRoutes = require("./routes/shelterRoute")(Cat, Shelter);
      const nestedRoutes = require("./routes/nestedRoutes")(Cat, Shelter);

      const seedShelter = require("./seeds/seedShelters");
      const seedCat = require("./seeds/seedCats");

      if (!(await Shelter.findOne())) {
        console.log("No shelters found, seeding data...");
        await seedShelter(Shelter);
      }
      if (!(await Cat.findOne())) {
        console.log("No cats found, seeding data...");
        await seedCat(Cat, Shelter);
      }

      
      app.get("/", (req, res) => {
        // res.render('./cats/index.ejs');
        res.redirect("/cats");
      });

      app.use("/cats", catRoutes);
      app.use("/shelters", shelterRoutes);
      app.use("/shelters/:shelterId/cats", nestedRoutes);

      app.post("/api/register", (req, res) => {
        db.registerUser(req.body)
          .then((msg) => {
            res.json({ message: msg });
            //res.redirect('/cats');
            //res.redirect("/api/login");
            //res.render("loginModal.ejs", { message: msg });
          })
          .catch((msg) => {
            res.status(422).json({ message: msg });
          });
      });

      app.post("/api/login", (req, res) => {
        db.checkUser(req.body)
          .then((user) => {
            let token = generateToken(user);

            console.log("Token generated:", token);
            // Set token as HTTP-only cookie

            res.cookie("token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              maxAge: 24 * 60 * 60 * 1000, // 24 hours
            });


            //res.json({ message: 'login successful', token: token });

            if (user.role === "admin") {
              res.redirect("/admin/cats");
            } else if (user.role === "user") {
              res.redirect("/cats");
            }
          })
          .catch((msg) => {
            res.status(422).json({ message: msg });
          });
      });


      app.post("/logout", (req, res) => {
        res.clearCookie("token");
        res.redirect("/cats");
      });


      app.get("/admin/cats",  async (req, res) => {
        const cats = await Cat.find({}).populate("shelter");
        res.render("adminDashboard/catsManage.ejs", { cats });
      });
      app.get("/admin/shelters", async (req, res) => {
        const shelters = await Shelter.find({});
        res.render("adminDashboard/sheltersManage.ejs", { shelters });
      });


//adoption Process 
app.get("/adoptionProcess", (req,res)=>{
  res.render("adoption/adoptionProcess.ejs");
})


//  //get all applications of all users

app.get("/admin/applications", isAdmin, async(req,res)=>{
  const applications = await Application.find({}).populate("cat").populate("user").populate("shelter");
  res.render("adminDashboard/applicationsManage.ejs", { applications });
})





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
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
