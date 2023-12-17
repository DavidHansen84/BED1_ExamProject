const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')
const bodyParser = require('body-parser')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var db = require('./models');
db.sequelize.sync({ force: false });

var adminRouter = require('./routes/admin');
var authRouter = require('./routes/auth');
var initRouter = require('./routes/init');
var brandRouter = require('./routes/brand');
var categoryRouter = require('./routes/category');
var productRouter = require('./routes/product');
var checkoutRouter = require('./routes/checkout');
var orderRouter = require('./routes/orders');
var roleRouter = require('./routes/roles');
var userRouter = require('./routes/users');
var searchRouter = require('./routes/search');
var statusRouter = require('./routes/status');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/init', initRouter);
app.use('/brands', brandRouter);
app.use('/categories', categoryRouter);
app.use('/products', productRouter);
app.use('/checkout', checkoutRouter);
app.use('/orders', orderRouter);
app.use('/roles', roleRouter);
app.use('/users', userRouter);
app.use('/search', searchRouter);
app.use('/status', statusRouter);

app.use(bodyParser.json())
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))


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
