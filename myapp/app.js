var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cors = require('cors');




var app = express();

app.use(cors());


//验证token中间件
app.use(async(req, res, next)=> {
  //排除登录和注册接口
  if (req.url.startsWith('/users/login') || req.url.startsWith('/users/register')) {
    next();
    return;
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = await verifyToken(token);
    console.log(decoded);
    req.user = decoded;
  } catch (error) {
    return res.json({
      code: 401,
      message: 'token验证失败'
    });
  }
  next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


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

app.listen(3003, function() {
  console.log('Example app listening on port 3003!');
});

module.exports = app;
