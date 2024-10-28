const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResoponse");
const Course = require("../models/Course")
const mongoose = require('mongoose')

exports.getAllCourses = asyncHandler(async function(req,res,next){
    if(req.params.bootcampId){
        const courses = await Course.find({bootcamp: req.params.bootcampId})
        res.status(200).json({success: true,count:courses.length ,data: courses})
    }
    else{
        res.status(200).json(res.advanceResults)
    }
})

exports.getCourse = asyncHandler(async function(req,res,next){
    let query;
    let courseId = req.params.id
    query = Course.findById(courseId).populate({
        path: 'bootcamp',
        select: 'name description'
    })
    const course = await query
    if(!course){
        return next(new ErrorResponse(`No Course present with id: ${courseId}`), 404)
    }

    res.status(200).json({
        success:true,
        data:course
    })
})

exports.addCourse = asyncHandler(async function (req,res,next){
    req.body.bootcamp = req.params.bootcampId
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    
    if((bootcamp.user.toString() !== req.user.id) && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to ${bootcamp._id} bootcamp`,401))
      }
    

    if(!bootcamp){
        return next(new ErrorResponse(`No Bootcamp found with id: ${req.params.bootcampId}, hence course can not be added`))
    }

    const course = await Course.create(req.body)
    res.status(201).json({
        success:true,
        data: course
    })
})

exports.updateCourse = asyncHandler(async function (req,res,next){
    let course = await Course.findById(req.params.id)

    if(!course){
        return next(new ErrorResponse(`No Course found with id: ${req.params.bootcampId}`))
    }

    if((course.user.toString() !== req.user.id) && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`,401))
      }

    course = await Course.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidatiors: true
    })
    res.status(201).json({
        success:true,
        data: course
    })
})

exports.deleteCourse = asyncHandler(async function(req,res,next){
    const course = await Course.findById(req.params.id)

    if((course.user.toString() !== req.user.id) && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`,401))
      }

    if(!course){
        return next(new ErrorResponse(`No Course found with id: ${req.params.id}`))
    }

    await Course.deleteOne({_id: new mongoose.Types.ObjectId(req.params.id)})

    res.status(200).json({
        success:true,
        data: {}
    })
})