// =============================================================================
// DEPENDENCIES
// =============================================================================

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const CatSchema = require("../models/cat");
const ShelterSchema = require("../models/shelter");
const userSchema = require("../models/user");
const ApplicationSchema = require("../models/application");

// =============================================================================
// MODEL VARIABLES
// =============================================================================

let User;
let Cat;
let Shelter;
let Application;

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

function connect() {
    return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGODB_CONN_STRING);
        
        db.on('error', (err) => {
            reject(err);
        });

        db.once('open', () => {
            console.log("Connected to MongoDB");

            // Initialize models
            if (!User) User = db.model("User", userSchema, "users");
            if (!Cat) Cat = db.model("Cat", CatSchema, "cats");
            if (!Shelter) Shelter = db.model("Shelter", ShelterSchema, "shelters");
            if (!Application) Application = db.model("Application", ApplicationSchema, "applications");

            resolve();
        });
    });
}

// =============================================================================
// USER AUTHENTICATION
// =============================================================================

function registerUser(userData) {
    return new Promise(function (resolve, reject) {
        console.log(userData);

        // Check if passwords match
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {
            // Check if email already exists
            User.findOne({ email: userData.email })
                .then(existingUser => {
                    if (existingUser) {
                        reject("Email already registered");
                    } else {
                        // Hash password and create user
                        bcrypt.hash(userData.password, 10).then(hash => {
                            userData.password = hash;
                            let newUser = new User(userData);

                            newUser.save().then(() => {
                                resolve("User " + userData.email + " successfully registered");
                            }).catch(err => {
                                if (err.code == 11000) {
                                    reject("Email already registered");
                                } else {
                                    reject("There was an error creating the user: " + err);
                                }
                            });
                        }).catch(err => reject(err));
                    }
                })
                .catch(err => reject("Database error: " + err));
        }
    });
}

function checkUser(userData) {
    return new Promise(function (resolve, reject) {
        User.find({ email: userData.email })
            .limit(1)
            .exec()
            .then((users) => {
                if (users.length == 0) {
                    reject("Unable to find user " + userData.email);
                } else {
                    // Compare password with hash
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
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
    connect,
    registerUser,
    checkUser,
    getCatModel: () => Cat,
    getShelterModel: () => Shelter,
    getUserModel: () => User,
    getApplicationModel: () => Application
};