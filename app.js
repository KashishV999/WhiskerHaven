const express= require('express');
const app=express();
const port=process.env.PORT || 3000;
const hostname='localhost';
const path=require('path');
const connectDB=require('./config/database'); //connect to the database

//ejs-mate
const ejsMate=require('ejs-mate');
app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'/views'));

//connection to mongoDB
connectDB(); //connect to the database

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




app.listen(port,hostname,()=>{
    console.log(`Server running at http://${hostname}:${port}/`);
})