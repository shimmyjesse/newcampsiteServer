// app.js handling most of the Middleware.

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
// Having two sets of parameters after a function call: JS has First-class functions/a function can return another function..
// when invoking teh require() and argument: 'session-file-store': require() is returning another function as its return value.
// Then, we're immediately calling that return function with that 2nd param list (session).
const passport = require('passport');
const authenticate = require('./authenticate');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// handle the Promise that's returned from the above 'connect' method:
connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Express Middleware
app.use(logger('dev')); //Morgan
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321')); //postiential conflict if using both cookieParser and ExpressSessions(has its own implementation of cookies) together.

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false, //when new session is created, but no updates are made, it is empty and, therefore, it won't be saved at the end of the req(no cookie will set to client, as well.)
  resave: false,
  store: new FileStore()  //creates new object to save session info to the server's hard drive (Not just the running app memory)
}));

app.use(passport.initialize()); //  // both only used when using Express Session-based authentication
app.use(passport.session());    //  // both provided by Passport, checks for existing session for client

app.use('/', indexRouter);
app.use('/users', usersRouter); //both routers were moved from below the auth function to above, to let auth users have access

// this is where we add authentication
function auth(req, res, next) {
  console.log(req.user);

  if (!req.user) {
      const err = new Error('You are not authenticated!');                    
      err.status = 401;
      return next(err);
  } else {
      return next();
  }
}

app.use(auth)

app.use(express.static(path.join(__dirname, 'public')));

// express server request from client: Middleware is applied to request in the order in which the middleware is declared here.

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;



////////////////////////////////////////////////////////////////////////////////////
//
// before Express sessions were implemented on function auth():

// // this is where we add authentication
// function auth(req, res, next) {
//   console.log(req.session);
  
//   if (!req.session.user) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         const err = new Error('You are not authenticated!');
//           res.setHeader('WWW-Authenticate', 'Basic'); // challenges user for credentials
//           err.status = 401;
//           return next(err);
//     }

//     const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//     const user = auth[0];
//     const pass = auth[1];
//     if (user === 'admin' && pass === 'password') {      /////////////////////////////////////////////
//         req.session.user = 'admin';
//         return next(); // authorized
//     } else {                                // this 'if/else' block of code: used for hard coding in user and pass.
//         const err = new Error('You are not authenticated!');  
//         res.setHeader('WWW-Authenticate', 'Basic'); // challenges user for credentials
//         err.status = 401;
//         return next(err);
//     }                                                   /////////////////////////////////////////////
//   } else {
//     if (req.session.user === 'admin') {
//       //console.log('req.session:', req.session);
//           return next();
//     } else {
//         const err = new Error('You are not authenticated!');
//         err.status = 401;
//         return next(err);
//     }
//   }
// }
//
////////////////////////////////////////////////////////////////////////////////////
