const passport = require('passport');
const {User} = require("../database/models/user.model");
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require("./config.util");
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const {ExtractJwt} = require("passport-jwt");
const {getRolesByID, verifyRole} = require("../services/role.service");
const ApiError = require("./ApiError");
const {ADMIN} = require('./constants.util');

// options for jwt authentication
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY,
};

passport.use(new LocalStrategy(User.authenticate()));

passport.use(new JwtStrategy(options, async (payload, done) => {
    const user = await User.findById({_id: payload._id});
    return user ? done(null, user) : done(null, false);
}));

verifyUsernamePassword = (req, res, next) => {
    passport.authenticate('local', {}, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json(info);
        req.user = user;
        next();
    })(req, res, next);
};

verifyJWT = passport.authenticate('jwt', {session: false});

getToken = (user) => {
    return jwt.sign(user, SECRET_KEY, {expiresIn: 3600});
};

verifyAdmin = async (req, res, next) => {
    try {
        await verifyRole([ADMIN], req.user.roles);
        next();
    }
    catch (err) {
        next(err);
    }
}

module.exports = {
    verifyUsernamePassword,
    getToken,
    verifyJWT,
    verifyAdmin,
};