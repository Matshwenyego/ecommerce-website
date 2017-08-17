var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('../models/user');

//Serialize
passport.serializeUser(function(user, done){
	done(null, user._id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		done(err, user);
	});
});

passport.use('local-login', new localStrategy({

	//username and password
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true

},	function(req, email, password, done){
	User.findOne({email: email}, function(err, user){
		if(err) return done(err);
		if(!user){
			return done(null, false, req.flash('loginMessage', 'No user has been found in the database'));
		}

		if(!user.comparePassword(password)){
			return done(null, false, req.flash('loginMessage', 'Sorry you supplied an incorrect password'));
		}
		return done(null, user);
	});
}));

exports.isAuthenticated = function(req, res, done){
	if(req.isAuthenticated()){
		return next();
	}
	res.directed('/login');
}