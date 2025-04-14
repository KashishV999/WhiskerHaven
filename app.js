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

app.get("/cats", async (req,res)=>{
    const cats= await Cat.find({}).populate('shelter', 'name'); //find all cats in the database and populate the shelter name
    res.render("cats/index.ejs", {cats});
})

app.get("/cats/:id", async(req,res)=>{
    const {id}= req.params; //get the id from the url
    const cat= await Cat.findById(id).populate('shelter', 'name location phone email'); //find the cat by id and populate the shelter name
    res.render("cats/show.ejs", {cat}); //render the show page for the cat
});



app.listen(port,hostname,()=>{
    console.log(`Server running at http://${hostname}:${port}/`);
})