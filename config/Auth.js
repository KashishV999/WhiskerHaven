const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportJWT = require("passport-jwt");

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    (req) => req.cookies?.token, // Extract from cookie
  ]),
  secretOrKey: process.env.SECRET_KEY,
};

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log("payload received", jwt_payload);

  if (jwt_payload) {
    next(null, {
      _id: jwt_payload._id,
      firstName: jwt_payload.firstName,
      lastName: jwt_payload.lastName,
      email: jwt_payload.email,
      role: jwt_payload.role,
    });
  } else {
    next(null, false);
  }
});

// tell passport to use our "strategy"
passport.use(strategy);


const optionalJwtMiddleware = (req, res, next) => {
  console.log("🔍 Global middleware running for:", req.path);

  // Try to authenticate with JWT from cookie or header
  passport.authenticate("jwt", { session: false }, (err, user) => {
    console.log(
      "🔑 JWT auth result:",
      user ? `User: ${user.firstName}` : "No user"
    );

    if (user) {
      req.user = user; // Attach to request
      res.locals.user = user; // Make available to all templates
    } else {
      res.locals.user = null; // Explicitly set to null
    }
    next();
  })(req, res, next);
};

const generateToken = (user) => {
  let payload = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, jwtOptions.secretOrKey);
};



const isAdmin=(req,res,next)=>{
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
        res.status(403).json({message: "Access denied"});
    }
};



module.exports = { optionalJwtMiddleware, jwtOptions, generateToken, isAdmin };

