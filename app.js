import bodyParser from 'body-parser';
import flash from 'connect-flash';
import connectMongoDBSession from 'connect-mongodb-session';
import csrf from 'csurf';
// import 'dotenv/config';
import compression from 'compression';
import express from 'express';
import session from 'express-session';
import { createWriteStream } from 'fs';
import helmet from 'helmet';
// import { createWriteStream, readFileSync } from 'fs';
// import https from 'https';
import { connect } from 'mongoose';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

import errorController from './controllers/error.js';
import User from './models/user.js';
import adminRoutes from './routes/admin.js';
import { expRouter as authRoutes } from './routes/auth.js';
import { expRouter as shopRoutes } from './routes/shop.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      upgradeInsecureRequests: null,
      'default-src': ["'self'"],
      'img-src': ["'self'", 'http: images:'],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-hashes'",
        "'sha256-{HASHED_EVENT_HANDLER}'",
      ],
      'script-src': ["'self'", "'unsafe-inline'", 'js.stripe.com'],
      'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      'style-src': ["'self'", 'https://fonts.googleapis.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      'frame-src': ["'self'", 'js.stripe.com'],
      'font-src': ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
    },
  })
);

app.use(compression());
const accessLogStream = createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));

const MongoDBStore = connectMongoDBSession(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_DB_URL,
  collection: 'sessions',
});

const csrfProtection = csrf();

// const privateKey = readFileSync('./server.key');
// const certificate = readFileSync('./server.cert');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'images'),
  filename: (req, file, cb) => cb(null, uuidv4() + '-' + file.originalname),
});
const fileFilter = (req, file, cb) => {
  const filterArray = ['image/png', 'image/jpg', 'image/jpeg'];
  filterArray.includes(file.mimetype) ? cb(null, true) : cb(null, false);
};

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.userName = req.session.user?.email;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// HACK: this will be solving all mongoose model related issue, as session middleware doesn't fetch a full mongoose user object with all functions
app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  User.findById(req.session.user?._id)
    .then(user => {
      // throw new Error('Async Dummy');
      user && (req.user = user);
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes.routes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
  });
});

connect(process.env.MONGO_DB_URL)
  .then(_ => app.listen(process.env.PORT || 3000))
  // .then(_ =>
  //   https
  //     .createServer({ key: privateKey, cert: certificate }, app)
  //     .listen(process.env.PORT || 3000)
  // )
  .catch(err => console.error(err));
