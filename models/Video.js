import Sequelize from 'sequelize';
import db from '../config/db.js';
import Page from './Page.js';
import User from './User.js';

const Video = db.define(
    'videos',
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        source: {
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
        autoplay: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        controls: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        loop: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        muted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
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

Page.hasMany(Video, { onDelete: 'cascade' });
Video.belongsTo(Page);
User.hasMany(Video, {foreignKey: 'editorId', onDelete: 'cascade'});
Video.belongsTo(User, {as: 'Editor', foreignKey: 'editorId'})

export default Video;
