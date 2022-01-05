import slugify from 'slugify';
import path from 'path';
import express from 'express';
import { Op } from 'sequelize';

// Models
import Project from '../models/Project.js';
import Page from '../models/Page.js';
import Meta from '../models/Metatag.js';
import Text from '../models/Text.js';
import Image from '../models/Image.js';
import Video from '../models/Video.js';

import { app } from '../server.js';

// Functions
import { getPages, getElementsFromPage } from '../utils/readProjectPages.js';
import {
    getElementsProps,
    ELEMENT_TYPES,
} from '../utils/viewProjectElements.js';

import { saveElementToDB } from '../utils/saveElement.js';

let projectId = null;

let messages = {};

const getHomePage = async (req, res) => {
    const user = await req.user;
    const projects = await Project.findAll();

    let page = undefined;
    if (req.query.pageId) {
        page = await Page.findByPk(Number(req.query.pageId));
    }

    // Clean global messages if the get request does not come from edit element
    if (!req.query.from === 'edit-element') messages = undefined;

    res.render('home', {
        page: 'Home',
        user: {
            name: user.name,
            admin: user.role === 'ADMIN' ? true : false,
        },
        projects: projects,
        project: req.project,
        errors: req.errors,
        messages,
        projectElements: req.elements,
        pageName: page != undefined ? page.name : undefined,
    });
};

const postHomePage = async (req, res) => {
    const user = await req.user;

    const errors = [];

    try {
        const project = await Project.create({
            name: req.body['project-name'],
            slug: slugify(req.body['project-slug'], { lower: true }),
            folder: req.body['project-folder'],
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
        const pages = getPages(`${path.resolve()}/projects/${project.folder}`);
        const projectElements = [];

        // Enable the local folder of the project to serve static files
        app.use(express.static(`projects/${project.folder}`));

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
                            project.folder
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
    messages = await saveElementToDB(req);

    res.redirect('/select-project?from=edit-element');
};

const getElementFromPageView = async (req, res) => {
    try {
        const { projectSlug, pageName, elementType, elementName } = req.params;
        const project = await Project.findOne({
            where: { slug: projectSlug },
        });

        const page = await Page.findOne({
            where: { name: pageName, projectId: project.id },
        });

        let element;
        switch (elementType) {
            case 'title':
                element = await Meta.findOne({
                    where: { name: elementName, pageId: page.id },
                });
                break;
            case 'metatag':
                element = await Meta.findOne({
                    where: { name: elementName, pageId: page.id },
                });
                break;
            case 'text':
                element = await Text.findOne({
                    where: { name: elementName, pageId: page.id },
                });
                break;
            case 'image':
                element = await Image.findOne({
                    where: { name: elementName, pageId: page.id },
                });
                break;
            case 'video':
                element = await Video.findOne({
                    where: { name: elementName, pageId: page.id },
                });
                break;

            default:
                break;
        }
        res.status(200).json(element);
    } catch (error) {
        res.status(404).json({ error: error.toString()})
    }
};

const getElementsFromPageView = async (req, res) => {
    try {
        const { projectSlug, pageName, elementType } = req.params;
        const project = await Project.findOne({
            where: { slug: projectSlug },
        });

        const page = await Page.findOne({
            where: { name: pageName, projectId: project.id },
        });

        let elements;
        switch (elementType) {
            case 'title':
                elements = await Meta.findAll({
                    where: { pageId: page.id, name: 'title' },
                });
                break;
            case 'metatag':
                elements = await Meta.findAll({
                    where: { pageId: page.id, name: { [Op.ne]: 'title'} },
                });
                break;
            case 'text':
                elements = await Text.findAll({
                    where: { pageId: page.id },
                });
                break;
            case 'image':
                elements = await Image.findAll({
                    where: { pageId: page.id },
                });
                break;
            case 'video':
                elements = await Video.findAll({
                    where: { pageId: page.id },
                });
                break;

            default:
                break;
        }
        res.status(200).json(elements);
    } catch (error) {
        res.status(404).json({ error: error.toString()})
    }
}

const saveElementFromPageView = async (req, res) => {
    const message = await saveElementToDB(req);
    res.send(message)
}

export {
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
};
