import Sequelize from 'sequelize';
import db from '../config/db.js';
import Page from './Page.js';
import User from './User.js';

const Meta = db.define(
    'metatags',
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        value: {
            type: Sequelize.STRING,
            allowNull: false,
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

Page.hasMany(Meta);
Meta.belongsTo(Page);
User.hasMany(Meta, {foreignKey: 'editorId'});
Meta.belongsTo(User, {as: 'Editor', foreignKey: 'editorId'})

export default Meta;
