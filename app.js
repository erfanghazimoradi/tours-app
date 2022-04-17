const { join } = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const { AppError } = require('./utils/appError');
const { globalErrorHandler } = require('./controllers/error-controller');

const apiRoutes = require('./routes/api-routes');
const appRoutes = require('./routes/views-routes');

// synchronous unhandled errors(uncaught exception)
process.on('uncaughtException', err => {
  console.error('[-] uncaught exception', err.name, err.message);
  console.info('[i] shutting down ...');

  process.exit(1);
});

const config = dotenv.config({ path: join(__dirname, './config.env') });

if (config.error) console.error(`[-] dotenv config > ${config.error.message}`);

const app = express();
const port = process.env.PORT || 8000;
const host = process.env.HOST || '127.0.0.1';
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, please try again in an hour'
});

// database connection
require('./config/database');

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

app.use('/', limiter);

// app routes
app.use('/', appRoutes);
app.use('/api', apiRoutes);

// not found routes
app.all('*', (request, response, next) =>
  next(new AppError(404, `Can not find ${request.originalUrl}`))
);

// global error handling
app.use(globalErrorHandler);

const server = app.listen(port, host, () =>
  console.info(`[i] listening on ${host}:${port} ...`)
);

// asynchronous unhandled errors(unhandled rejection)
process.on('unhandledRejection', err => {
  console.error('[-] unhandled rejection', err.name, err.message);
  console.info('[i] shutting down ...');

  server.close(() => {
    process.exit(1);
  });
});
