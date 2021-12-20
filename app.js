import express, { urlencoded } from 'express';
import passport from 'passport';
import flash from 'express-flash';
import session from 'express-session';

import db from './config/db.js';
import serverConfig from './config/server.js';
import router from './routes/index.js';
import { initializePassport } from './config/passport.js';
import User from './models/User.js';

// The callbacks are the "getUserByName" and "getUserById" functions called in initializePassport in passport.js
initializePassport(
    passport,
    username => User.findOne({ where: { name: username } }),
    id => User.findOne({ where: { id: id } })
);

const app = express();

// Connect with the database
db.authenticate()
    .then(() => console.log('Database connection successful'))
    .catch(error => console.error(error));

// Enable PUG
app.set('view engine', 'pug');

// Use flash
app.use(flash());

// Use session
app.use(
    session({
        secret: serverConfig.secret,
        resave: false,
        saveUninitialized: false,
    })
);

// Use passport
app.use(passport.initialize());
app.use(passport.session());

// Add body parser
app.use(express.urlencoded({ extended: true }));

// Enable routing
app.use('/', router);

// Public folder
app.use(express.static('public'));

// Configure server
app.listen(serverConfig.port, serverConfig.host, () => {
    const { port, host } = serverConfig;
    console.log('Server ready and listen on ' + host + ':' + port);
});
