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

Page.hasMany(Text);
Text.belongsTo(Page);
User.hasMany(Text, {foreignKey: 'editorId'});
Text.belongsTo(User, {as: 'Editor', foreignKey: 'editorId'})

export default Text;
