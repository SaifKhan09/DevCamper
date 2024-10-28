const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResoponse");
const User = require('../models/User')
const advanceResults = require('../middleware/advanceFiltering')

exports.getUsers = asyncHandler(async(req,res,next)=>{
    res.status(200).json(res.advanceResults)
})

exports.getSingleUser = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    res.status(200).json({success:true,data:user})
})

exports.createUser = asyncHandler(async(req,res,next)=>{
    const user = await User.create(req.body);
    res.status(201).json({success:true,data:user})
})

exports.updateUser = asyncHandler(async(req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({success:true,data:user})
})

exports.deleteUser = asyncHandler(async(req,res,next)=>{
    await User.findByIdAndDelete(req.params.id);
    res.status(201).json({success:true,data:{}})
})