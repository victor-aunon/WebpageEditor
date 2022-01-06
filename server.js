import express from 'express';
import passport from 'passport';
import flash from 'express-flash';
import session from 'express-session';
import fileUpload from 'express-fileupload';

// Configs
import db from './config/db.js';
import serverConfig from './config/server.js';
import router from './routes/index.js';
import { initializePassport } from './config/passport.js';

// Models
import User from './models/User.js';

// The callbacks are the "getUserByName" and "getUserById" functions called in initializePassport in passport.js
initializePassport(
    passport,
    username => User.findOne({ where: { name: username } }),
    id => User.findOne({ where: { id: id } })
);

const app = express();

// Connect with the database
// db.authenticate()
db.sync({ force: false, alter: false })
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
        cookie: {
            expires: Date.now() + 1000*3600*24*7,
            maxAge: 1000*3600*24*7 // One week
        }
    })
);

// Use passport
app.use(passport.initialize());
app.use(passport.session());

// Use fileUpload
app.use(fileUpload({
    createParentPath: true,
    safeFileNames: true,
    useTempFiles : true,
    tempFileDir : './tmp/',
    preserveExtension: true,
    debug: false
}))

// Add body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Enable routing
app.use('/', router);

// Public folder
app.use(express.static('public'));

// Configure server
app.listen(serverConfig.port, serverConfig.host, () => {
    const { port, host } = serverConfig;
    console.log('Server ready and listen on ' + host + ':' + port);
});

export { app };
