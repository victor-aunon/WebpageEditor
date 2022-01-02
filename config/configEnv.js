import path from 'path';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env' });
}

export const config = {
    development: {
        database: 'webpage_editor_dev',
        username: null,
        password: null,
        host: null,
        port: null,
        dialect: 'sqlite',
        logging: false,
        storage: path.join(path.resolve(), 'webpage_editor.db'),
    },
    production: {
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        storage: null,
    },
};
