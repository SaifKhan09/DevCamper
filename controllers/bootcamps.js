const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResoponse");
const geocoder = require("../utils/geoCoder");
const dotenv = require('dotenv')
const path = require('path');

exports.getBootcamps = asyncHandler(async (req, res, next) => {
 
  res
    .status(200)
    .json(res.advanceResults);
});

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user data to req.body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})

  // If the user is not admin then they can only add one bootcamp
  if(publishedBootcamp && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User with ID ${req.user.id} has already published a bootcamp`,400))
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await Bootcamp.findById(id).populate({
    path: 'courses',
    select: 'title tuition'
  });
  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404)
    );

  res.status(200).json({ success: true, data: bootcamp });
});

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await Bootcamp.findById(req.params.id)
  
  if((bootcamp.user.toString() !== req.user.id) && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`,401))
  }

  if (!bootcamp)
    next(new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404));

  bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await Bootcamp.findById(id)
  if((bootcamp.user.toString() !== req.user.id) && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this bootcamp`,401))
  }
  bootcamp = await Bootcamp.deleteMany({_id:id});

  if (!bootcamp)
    next(new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404));

  // await bootcamp.deleteOne({document:false,query:true})
  res.status(200).json({ success: true, data: {} });
});

exports.getBootcampsByRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  // Get lattitude and longitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lon = loc[0].longitude;

  // Calculate radius using radians
  // Divide dist by radius of earth
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await Bootcamp.findById({_id:id})

  if((bootcamp.user.toString() !== req.user.id) && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`,401))
  }
  
  if (!bootcamp)
    return next(new ErrorResponse(`Bootcamp not found with ${req.params.id}`, 404));

  if(!req.files)
    return next(new ErrorResponse('Please upload a file', 400));

  const file = req.files.files

  // Validaiton to make sure that it is a photo
  if(!file.mimetype.startsWith('image')){
    return next(new ErrorResponse('Please Upload an image',400))
  }
  // Validaiton to make sure that it is under the specified file size
  if(file.size > process.env.MAX_FILE_UPLOAD){
    return next(new ErrorResponse(`Please upload an image that is less than ${process.env.MAX_FILE_UPLOAD}`, 400))
  }

  // Create a new fileName
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err=>{
    if(err){
      console.log(err)
      return next(new ErrorResponse('Problem with file upload'),500)
    }

    await Bootcamp.findByIdAndUpdate(id,{ photo: file.name })
    res.status(200).json({
      success: true,
      data:file.name
    })
  })

});