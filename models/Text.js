import Sequelize from 'sequelize';
import db from '../config/db.js';
import Page from './Page.js';
import User from './User.js';

const Text = db.define(
    'texts',
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        style: {
            type: Sequelize.STRING,
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

Page.hasMany(Text, { onDelete: 'cascade' });
Text.belongsTo(Page);
User.hasMany(Text, {foreignKey: 'editorId', onDelete: 'cascade'});
Text.belongsTo(User, {as: 'Editor', foreignKey: 'editorId'})

export default Text;
