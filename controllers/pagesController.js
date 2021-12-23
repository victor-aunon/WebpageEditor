import slugify from 'slugify';
import Project from '../models/Project.js';

const getHomePage = async (req, res) => {
    const user = await req.user;
    res.render('home', {
        page: 'Home',
        user: {
            name: user.name,
            admin: user.role === 'ADMIN' ? true : false,
        },
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
        errors.push(error.errors[0]);
        console.log(error.errors[0].message);
    }

    res.render('home', {
        page: 'Home',
        user: {
            name: user.name,
            admin: user.role === 'ADMIN' ? true : false,
        },
        errors,
    });
};

const loginPage = (req, res) => {
    res.render('login', {
        page: 'Login',
        // messages: req.messages,
    });
};

export { getHomePage, postHomePage, loginPage };
