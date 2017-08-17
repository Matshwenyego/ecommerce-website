//Require
var express = require('express');
var morgan = require('morgan');
var ejs = require('ejs');
var engine = require('ejs-mate');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var config = require('./config/secret');
var mongoStore = require('connect-mongo')(session);
var passport = require('passport');
var Category = require('./models/category');


//connection
mongoose.Promise = global.Promise; 
mongoose.connect(config.database, function(err){
	if(err){
		console.log('connection to database failed');
	}
	else{
		console.log('connection to database succcessfully established');
	}
});

//Execute
var app = express();

var cartLength = require('./middlewares/middlewares');

//Middleware
app.use(morgan('dev'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: config.secretKey,
	store: new mongoStore({url: config.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
}); 
app.use(cartLength);
app.use(function(req, res, next){
	Category.find({}, function(err, categories){
		if(err) return next(err);

		res.locals.categories = categories;
		next();
	});
});




//Routes
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);



//Kick off application using the listen method
app.listen(config.port, function(req, res){
	console.log('Application is now running on port 3000');
});

