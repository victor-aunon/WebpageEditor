import express from 'express';
import passport from 'passport';

import {
    getHomePage,
    postHomePage,
    loginPage,
    retrieveProjectElements,
    getProjectPage,
    getElementForm,
    saveElement,
    getElementFromPageView,
    saveElementFromPageView,
    getElementsFromPageView
} from '../controllers/pagesController.js';

const router = express.Router();

// Defining routes
router.get('/', checkAuthentication, getHomePage);

router.post('/', checkAuthentication, postHomePage);

router.get('/login', checkNotAuthentication, loginPage);

router.get(
    '/select-project',
    checkAuthentication,
    retrieveProjectElements,
    getHomePage
);

router.post(
    '/select-project',
    checkAuthentication,
    retrieveProjectElements,
    getHomePage,
);

// Specific page of the project
router.get('/projects/:slug/:page', checkAuthentication, getProjectPage);

router.get('/element/:elementType/:id', checkAuthentication, getElementForm);

router.post('/element/:elementType/:id', checkAuthentication, saveElement);

// Routes from the page view
router.get(
    '/api/elements/:projectSlug/:pageName/:elementType',
    checkAuthentication,
    getElementsFromPageView
);

router.get(
    '/api/element/:projectSlug/:pageName/:elementType/:elementName',
    checkAuthentication,
    getElementFromPageView
);

router.put(
    '/api/element/:elementType/:id',
    checkAuthentication,
    saveElementFromPageView
);

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
