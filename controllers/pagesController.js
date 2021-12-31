import slugify from 'slugify';
import path from 'path';

// Models
import Project from '../models/Project.js';
import Page from '../models/Page.js';

// Functions
import { getPages, getElementsFromPage } from '../utils/readProjectPages.js';
import { getElementsProps } from '../utils/manageProjectElements.js';

const getHomePage = async (req, res) => {
    const user = await req.user;
    const projects = await Project.findAll();

    res.render('home', {
        page: 'Home',
        user: {
            name: user.name,
            admin: user.role === 'ADMIN' ? true : false,
        },
        projects: projects,
        errors: req.errors,
        projectElements: req.elements,
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
    const project = await Project.findOne({
        where: { name: req.body.project },
    });
    const currentUser = await req.user;

    try {
        const pages = getPages(`${path.resolve()}/projects/${project.name}`);
        const projectElements = [];

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
                        path: `${path.resolve()}/projects/${project.name}/${pageFile}`,
                        projectId: project.id
                    })

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
        console.log(projectElements)
        req.elements = projectElements;
    } catch (error) {
        console.log(error)
        if (error.errors) {
            req.errors = [
                { message: error.errors[0].message },
            ];
        } else {
            req.errors = [
                { message: 'No existen páginas para este proyecto.' },
            ];
        }
    }
    return next();
};

export { getHomePage, postHomePage, loginPage, retrieveProjectElements };
