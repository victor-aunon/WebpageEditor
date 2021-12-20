import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env' })
}

const serverConfig = {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 3000,
    secret: process.env.SECRET
}

export default serverConfig;
