import express , { urlencoded } from 'express';

import db from './config/db.js'
import serverConfig from './config/server.js'
import router from './routes/index.js'

const app = express()

// Connect with the database
db.authenticate()
    .then(() => console.log('Database connection successful'))
    .catch(error => console.error(error))

// Enable PUG
app.set('view engine', 'pug')

// Add body parser
app.use(express.urlencoded({ extended: true }))

// Enable routing
app.use('/', router)

// Public folder
app.use(express.static('public'))

// Configure server
app.listen(serverConfig.port, serverConfig.host, () => {
    const { port, host } = serverConfig;
    console.log('Server ready and listen on ' + host + ':' + port)
})
