import slugify from 'slugify';
import path from 'path';
import express from 'express';

// Models
import Project from '../models/Project.js';
import Page from '../models/Page.js';

import { app } from '../server.js';

// Functions
import { getPages, getElementsFromPage } from '../utils/readProjectPages.js';
import {
    getElementsProps,
    ELEMENT_TYPES,
} from '../utils/viewProjectElements.js';

import { saveElementToDB } from '../utils/saveElement.js'

let projectId = null;

const getHomePage = async (req, res) => {
    const user = await req.user;
    const projects = await Project.findAll();

    let page = undefined;
    if (req.query.pageId) {
        page = await Page.findByPk(Number(req.query.pageId))
    }

    res.render('home', {
        page: 'Home',
        user: {
            name: user.name,
            admin: user.role === 'ADMIN' ? true : false,
        },
        projects: projects,
        project: req.project,
        errors: req.errors,
        projectElements: req.elements,
        pageName: page != undefined ? page.name : undefined
    });
};

const postHomePage = async (req, res) => {
    const user = await req.user;

    const errors = [];

    try {
        const project = await Project.create({
            name: req.body['project-name'],
            slug: slugify(req.body['project-slug'], { lower: true }),
            path: req.body['project-path'],
            authorId: user.id,
        });
    } catch (error) {
        errors.push({
            message: error.errors[0].message,
            value: error.errors[0].value + ' ya existe.',
        });
        console.log(error.errors[0].message);
    }

    const projects = await Project.findAll();

    res.render('home', {
        page: 'Home',
        user: {
            name: user.name,
            admin: user.role === 'ADMIN' ? true : false,
        },
        projects,
        errors,
    });
};

const loginPage = (req, res) => {
    res.render('login', {
        page: 'Login',
    });
};

const retrieveProjectElements = async (req, res, next) => {

    if (req.body.project) projectId = req.body.project;
    const project = await Project.findOne({
        where: { name: projectId },
    });
    const currentUser = await req.user;

    try {
        const pages = getPages(`${path.resolve()}/projects/${project.slug}`);
        const projectElements = [];

        // Enable the css and js folders of the project to serve static files
        app.use(express.static(`projects/${project.slug}/css`));
        app.use(express.static(`projects/${project.slug}/js`));

        if (pages.length > 0) {
            for (const pageFile of pages) {
                let pageDB = await Page.findOne({
                    where: {
                        projectId: project.id,
                        file: pageFile,
                    },
                });

                if (!pageDB) {
                    await Page.create({
                        name: pageFile.split('.')[0],
                        file: pageFile,
                        path: `${path.resolve()}/projects/${
                            project.slug
                        }/${pageFile}`,
                        projectId: project.id,
                    });

                    pageDB = await Page.findOne({
                        where: {
                            projectId: project.id,
                            file: pageFile,
                        },
                    });
                }

                const pageElements = getElementsFromPage(pageDB.path);

                projectElements.push({
                    name: pageDB.name,
                    elements: await getElementsProps(
                        currentUser.id,
                        pageDB.id,
                        pageElements
                    ),
                });
            }
        }
        req.elements = projectElements;
        req.project = project;
    } catch (error) {
        console.log(error);
        if (error.errors) {
            req.errors = [{ message: error.errors[0].message }];
        } else {
            req.errors = [
                { message: 'No existen páginas para este proyecto.' },
            ];
        }
    }
    // Using next because this function add properties to the request,
    // does not respond anything
    return next();
};

const getProjectPage = async (req, res) => {
    const project = await Project.findOne({
        where: { slug: req.params.slug },
    });

    let page = undefined;
    if (project) {
        page = await Page.findOne({
            where: { name: req.params.page, projectId: project.id },
        });
    }

    if ((project != undefined) & (page != undefined)) {
        res.sendFile(`${page.path}`);
    } else {
        res.sendStatus(404);
    }
};

const getElementForm = async (req, res) => {
    const { id, elementType } = req.params;

    const element = await ELEMENT_TYPES[
        Object.keys(ELEMENT_TYPES).filter(
            el => ELEMENT_TYPES[el].name === elementType
        )
    ].model.findByPk(id);

    if (element) {
        res.render('element_form', { element, type: elementType });
    } else {
        res.sendStatus(404);
    }
};

const saveElement = async (req, res) => {
    console.log(req.params)
    console.log(req.params.elementType)
    req.messages = await saveElementToDB(req)
    if(req.files) console.log(req.files)
    res.redirect('/select-project')
}

export {
    getHomePage,
    postHomePage,
    loginPage,
    retrieveProjectElements,
    getProjectPage,
    getElementForm,
    saveElement,
};
