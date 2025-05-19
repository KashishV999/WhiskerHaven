//Connection to mongoDB using mongoose
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const CatSchema= require("../models/cat");
const ShelterSchema= require("../models/shelter");
// const connectDB = async () => {
//      await mongoose
//     .connect("mongodb://127.0.0.1:27017/WhiskersWay")
//     .then(() => {
//       console.log("MongoDB connected successfully");
//     })
//     .catch((err) => {
//       console.log("MongoDB connection failed", err);
//     });
// };

// module.exports = connectDB;


let Schema = mongoose.Schema;
//userSchema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address"
    ]
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });



let User;
let Cat;
let Shelter;


//register user
function connect(){
    return new Promise(function(resolve,reject){
        let db= mongoose.createConnection(process.env.MONGODB_CONN_STRING);
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });

        db.once('open', () => {
            console.log("Connected to MongoDB");

      if (!User) User = db.model("User", userSchema, "users");
      if (!Cat) Cat = db.model("Cat", CatSchema, "cats");
      if (!Shelter) Shelter = db.model("Shelter", ShelterSchema, "shelters");

            resolve();
        });
    })
}

function registerUser(userData) {
    return new Promise(function (resolve, reject) {

        console.log(userData);

        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {

            User.findOne({ email: userData.email })
        .then(existingUser => {
          if (existingUser) {
            reject("Email already registered"); // Early rejection
          }})

            bcrypt.hash(userData.password, 10).then(hash=>{ // Hash the password using a Salt that was generated using 10 rounds
                
                userData.password = hash;


                let newUser = new User(userData);

                newUser.save().then(() => {
                    resolve("User " + userData.email + " successfully registered");
                }).catch(err => {
                    if (err.code == 11000) {
                        console.log("11000 errorrrrrr");
                        reject("Email already registered");
                    } else {
                        reject("There was an error creating the user: " + err);
                    }
                });
            }).catch(err=>reject(err));
        }
    });      
};



//login user
function checkUser(userData) {
    return new Promise(function (resolve, reject) {

        User.find({ email: userData.email })
        .limit(1)
        .exec()
        .then((users) => {

            if (users.length == 0) {
                reject("Unable to find user " + userData.email);
            } else {
                bcrypt.compare(userData.password, users[0].password).then((res) => {
                    if (res === true) {
                        resolve(users[0]);
                    } else {
                        reject("Incorrect password for user " + userData.email);
                    }
                });
            }
        }).catch((err) => {
            reject("Unable to find user " + userData.email);
        });
    });
};

module.exports = {
    connect,
    registerUser,
    checkUser,
    getCatModel: () => Cat,
    getShelterModel: () => Shelter,
    getUserModel: () => User
};
