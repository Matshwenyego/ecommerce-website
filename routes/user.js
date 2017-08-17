var router = require('express').Router();
var User = require('../models/user');
// var crypto = require('crypto');

var passport = require('passport');
var passportConf = require('../config/passport');

var Product = require('../models/product');
var Cart = require('../models/cart');
var async = require('async');

// router.get('/products', function(req, res){
// 	Product.find({}, function(err, products){
// 		if(err) return next(err);

// 		res.json(products);
// 	});
// });

router.get('/login', function(req, res){
	if(req.user) res.redirect('/');

		res.render('accounts/login', {
			message: req.flash('loginMessage')
		});
});

router.post('/login', passport.authenticate('local-login',{
	successRedirect: '/profile',
	failureRedirect: '/login',
	failureFlash: true
}));

router.get('/profile', function(req, res){
	User.findOne({_id:req.user._id}, function(err, user){
		if(err) return next(err);

		res.render('accounts/profile', {user: user});	
	});

	
});

router.get('/users', function(req, res, next){
	User.find({}, function(err, user){
		if(err) return next(err);
		res.json(user);
	});

});

router.get('/signup', function(req, res, next){
	res.render('accounts/signup', {
		errors: req.flash('errors')
	});
});

router.post('/signup', function(req, res, next){
	async.waterfall([

				function(callback){
						var user = new User();

						user.email = req.body.email;
						user.password = req.body.password;
						user.profile.name = req.body.name;
						user.profile.picture = user.gravatar();

						User.findOne({email: req.body.email}, function(err, userExist){
							if(userExist){
								console.log('the user with email: ' + req.body.email + ' already exists');
								req.flash('errors', 'Account with that email already exist');
								return res.redirect('/signup');
							}
							else{
								user.save(function(err, user){
									if(err) return next(err);
									
										callback(null, user);
									})				
							}
						});
				},
				function(user){
					var cart = new Cart();
					cart.owner = user._id;
					cart.save(function(err){
						if(err) return next(err);

						req.logIn(user, function(err){
							if(err) return next(err);
							res.redirect('/profile');
					});
				});	
				}
		])
});

router.get('/edit-profile', function(req, res, next){
	res.render('accounts/edit-profile', { message:  req.flash('success')});
});

router.post('/edit-profile', function(req, res, next){
	User.findOne({_id: req.user._id}, function(err, user){
		if(err) return next(err);

		if(req.body.name)
			user.profile.name = req.body.name;

		if(req.body.address)
			user.address = req.body.address;

		user.save(function(err){
			if(err) return next(err);

			req.flash('success', 'Successfully edited your profile');
			return res.redirect('/edit-profile');

		});
	});
});


router.get('/logout', function(req, res, next){
	req.logout();
	res.redirect('/');
});




module.exports = router;