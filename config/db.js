// / <reference types="sequelize" />
import Sequelize from 'sequelize';
import dotenv from 'dotenv';

import {config} from './configEnv.js'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env' });
}

const env = process.env.NODE_ENV || 'development';

// Initialize the database
const db = new Sequelize(
    config[env].name,
    config[env].user,
    config[env].password,
    {
        host: config[env].host,
        port: config[env].port,
        dialect: config[env].dialect,
        logging: config[env].logging,
        storage: config[env].storage,
        define: {
            timestamps: false,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

export default db;
