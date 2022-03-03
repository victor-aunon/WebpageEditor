import Sequelize from 'sequelize';
import db from '../config/db.js';

import Project from './Project.js';

const Page = db.define(
    'pages',
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        file: {
            type: Sequelize.STRING,
            allowNull: false,
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

Project.hasMany(Page, { onDelete: 'cascade' });
Page.belongsTo(Project);

export default Page;
