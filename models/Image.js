import Sequelize from 'sequelize';
import db from '../config/db.js';
import Page from './Page.js';
import User from './User.js';

const Image = db.define(
    'images',
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        source: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        alt: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        width: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        height: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        classlist: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: '',
        },
        editions: {
            type: Sequelize.SMALLINT,
            defaultValue: 0,
            allowNull: false,
        }
    },
    {
        timestamps: true,
    }
);

Page.hasMany(Image, { onDelete: 'cascade' });
Image.belongsTo(Page);
User.hasMany(Image, {foreignKey: 'editorId', onDelete: 'cascade'});
Image.belongsTo(User, {as: 'Editor', foreignKey: 'editorId'})

export default Image;
