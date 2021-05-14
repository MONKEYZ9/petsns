var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

const jwtMiddleware = require('./module/jwtMiddleware');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 모든 라우터에 접근할때 사용자 인지정보를 확인하기 위해서 라우터 앞단에 붙여줌으로 확인한다는거야 // 이렇게 했으면 navbar.ejs로 가서 로그인했을때는 다르게 나오게 설정해야해
app.use(jwtMiddleware);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// socket.io사용
app.io = require("socket.io")();

app.io.on("connection", (socket) => {
  socket.on("chat-msg", (user, msg) => {
    app.io.emit("chat-msg", user, msg);
  });
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
