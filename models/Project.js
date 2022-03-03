import Sequelize from 'sequelize';
import db from '../config/db.js';

import User from './User.js';

const Project = db.define(
    'projects',
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        slug: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        folder: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: true,
    }
);


User.hasMany(Project, {foreignKey: 'authorId'})
Project.belongsTo(User, {as: 'Author', foreignKey: 'authorId', onDelete: 'cascade'})

export default Project;
