const express= require('express');
const app=express();
const port=process.env.PORT || 3000;
const hostname='localhost';
const path=require('path');
const connectDB=require('./config/database'); //connect to the database
//connection to mongoDB
connectDB(); //connect to the database

//models
const Cat=require('./models/cat'); //model for cat
const Shelter=require('./models/shelter'); //model for shelter

//ejs-mate
const ejsMate=require('ejs-mate');
app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'/views'));



//MIDDLEWARES
//serve static files or assets
app.use(express.static(path.join(__dirname,'/public'))); //serve static files from public directory
app.use(express.urlencoded({extended:true})); //parse urlencoded data
app.use(express.json()); //parse json data

//method-override  -> Forms with PUT and DELETE requests
const methodOverride=require('method-override');
app.use(methodOverride('_method'));


app.get("/", (req,res)=>{
    res.render('home.ejs');
})


//Import cat routes
const catRoutes=require('./routes/catsRoute'); //import routes for cats

//Use routes
app.use("/cats", catRoutes); //use routes for cats



//Import Shelter routes
const shelterRoutes=require('./routes/shelterRoute'); //import routes for shelters
//Use routes
app.use("/shelters", shelterRoutes); //use routes for shelters



//import nested routes for shelters and cats
const nestedRoutes=require('./routes/nestedRoutes'); //import nested routes for shelters and cats
//use nested routes
app.use("/shelters/:shelterId/cats",nestedRoutes); //use nested routes for shelters and cats

app.listen(port,hostname,()=>{
    console.log(`Server running at http://${hostname}:${port}/`);
})