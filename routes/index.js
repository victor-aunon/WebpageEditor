import express from 'express';
import passport from 'passport';

import {
    getHomePage,
    postHomePage,
    loginPage,
    retrieveProjectElements,
    // getProjectPage
} from '../controllers/pagesController.js';

const router = express.Router();

// Defining routes
router.get('/', checkAuthentication, getHomePage);

router.post('/', checkAuthentication, postHomePage);

router.get('/login', checkNotAuthentication, loginPage);

router.post('/select-project', checkAuthentication, retrieveProjectElements, getHomePage);

// Specific page of the project
// router.get('/projects/:slug/:page', checkAuthentication, getProjectPage);

router.post(
    '/login',
    checkNotAuthentication,
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
    })
);

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
});

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkNotAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

export default router;
