import Sequelize from 'sequelize';
import db from '../config/db.js';

const User = db.define(
    'users',
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        salt: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        role: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'EDITOR',
            validate: {
                isIn: [['EDITOR', 'ADMIN']],
            },
        },
    },
    {
        timestamps: false,
    }
);

export default User;
