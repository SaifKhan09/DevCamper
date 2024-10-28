const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResoponse");
const Review = require("../models/Review")
const Bootcamp = require("../models/Bootcamp");
const mongoose = require('mongoose')

exports.getAllReviews = asyncHandler(async function(req,res,next){
    if(req.params.bootcampId){
        const reviews = await Review.find({bootcamp: req.params.bootcampId})
        res.status(200).json({success: true,count:reviews.length ,data: reviews})
    }
    else{
        res.status(200).json(res.advanceResults)
    }
})

exports.getSingleReview = asyncHandler(async function(req,res,next){
    const review = await Review.findById(req.params.id).populate({path:'bootcamp',select:'name description'})

    if(!review){
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`,404))
    }

    res.status(200).json({success: true, data: review})
})

exports.addReview = asyncHandler(async function(req,res,next){
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if(!bootcamp){
        return next(new ErrorResponse(`No Bootcamp with id : ${req.params.bootcampId}`,404))
    }

    const review = await Review.create(req.body)
    res.status(201).json({success: true, data: review})
})

exports.updateReview = asyncHandler(async function(req,res,next){
    
    let review = await Review.findById(req.params.id)
    if(!review){
        return next(new ErrorResponse(`No Review with id : ${req.params.id}`,404))
    }

    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not Authorized to Update Review`,401))
    }

    review = await Review.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})

    res.status(201).json({success: true, data: review})
})

exports.deleteReview = asyncHandler(async function(req,res,next){
    
    const review = await Review.findById(req.params.id)
    if(!review){
        return next(new ErrorResponse(`No Review with id : ${req.params.id}`,404))
    }

    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`Not Authorized to Delete Review`,401))
    }

    await Review.findByIdAndDelete(req.params.id)

    res.status(201).json({success: true, data: {}})
})

