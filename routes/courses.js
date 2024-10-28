const express = require('express')
const router = express.Router({mergeParams:true});
const advanceFiltering = require('../middleware/advanceFiltering')
const Course = require('../models/Course')
const {protect,authorize} = require('../middleware/auth')

const {getAllCourses,getCourse,addCourse,updateCourse,deleteCourse} = require('../controllers/courses')

router.route('/').get(advanceFiltering(Course,{
    path: 'bootcamp',
    select: 'name description'
}),getAllCourses)
.post(protect,authorize('publisher','admin'),addCourse)

router.route('/:id').get(getCourse)
.put(protect,authorize('publisher','admin'),updateCourse)
.delete(protect,authorize('publisher','admin'),deleteCourse)
module.exports = router;