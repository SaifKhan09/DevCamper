const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

// load env variable
dotenv.config({ path: './config/config.env' })

// load schema
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

// connect to DB
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

// Read JSON files 
const Bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf-8')
);

const Courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`,'utf-8')
);

const Users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`,'utf-8')
);

const Reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`,'utf-8')
);


// Import into DB
const importData = async ()=>{
    try {
        await Bootcamp.create(Bootcamps)
        await Course.create(Courses)
        await User.create(Users)
        await Review.create(Reviews)
        console.log('Data Imported...'.green.inverse)
        process.exit()
    } catch (error) {
        console.log(error)
    }
}

const deleteData = async () =>{
    try {
        await Bootcamp.deleteMany()
        await Course.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Data Deleted...'.red.inverse)
        process.exit()
    } catch (error) {
        console.log(error)
    }
}

if(process.argv[2] === '-import'){
    importData()
}
else if(process.argv[2] === '-deleteall'){
    deleteData()
}