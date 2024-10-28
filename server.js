// Imports
const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookeieParser = require('cookie-parser')
const colors = require('colors')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')

// Fetch routes
const bootcampRoutes = require('./routes/bootcamps')
const coursesRoutes = require('./routes/courses')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const reviewRoutes = require('./routes/reviews')


// Load environment variables
dotenv.config({path:'./config/config.env'})

// Connect to database
connectDB();


const app = express()

// body middleware
app.use(express.json())

// cookie-parser
app.use(cookeieParser())

// Logging Middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

// File Upload middleware
app.use(fileUpload())

// Sanitize Data
app.use(mongoSanitize())

// Adding security headers using helmet
app.use(helmet())

// Prevent cross site scriptiong attacks
app.use(xss())

// Rate limiting
const limiter = rateLimit({
    windowMs: 10*60*1000,
    max: 100
})

app.use(limiter)

// Prevent http param pollution
app.use(hpp())

// Enable CORS
app.use(cors())

// Set static folder
app.use(express.static(path.join(__dirname,'public')))


app.use('/api/v1/bootcamps',bootcampRoutes)
app.use('/api/v1/courses',coursesRoutes)
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/users',userRoutes)
app.use('/api/v1/reviews',reviewRoutes)

// error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} environment on port ${PORT}`.yellow.bold))

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error : ${err.message}`.red.bold)
    server.close(()=> process.exit(1) ) 
})