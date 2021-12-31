import Sequelize from 'sequelize';
import db from '../config/db.js';

import Project from './Project.js';

const Page = db.define(
    'pages',
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        file: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        path: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: true,
    }
);

Project.hasMany(Page);
Page.belongsTo(Project);

export default Page;