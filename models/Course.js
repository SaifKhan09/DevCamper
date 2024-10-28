const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

CourseSchema.statics.getAverageCost = async function(bootcampId) {

  const obj = await this.aggregate([
    {
      $match: {bootcamp: new mongoose.Types.ObjectId(bootcampId)}
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: {$avg:'$tuition'}
      }
    }
  ])
  if (obj && obj.length > 0 && obj[0].averageCost) {
    try {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
        averageCost: Math.ceil(obj[0].averageCost/10) * 10
      })
    } catch (error) {
      console.error(error)
    }
  } else {
    console.log("No courses found for bootcamp", bootcampId)
  }
}

CourseSchema.post('save', async function(next){
  this.constructor.getAverageCost(this.bootcamp)
})

CourseSchema.pre('deleteOne',{ document: false, query: true }, async function(next){
  const courseId = this.getQuery()._id;
  const course = await this.model.findById(courseId);
  tempCourseId = course.bootcamp
})

CourseSchema.post('deleteOne',{document:false,query:true},async function(next){
  await this.model.getAverageCost(tempCourseId);
})

let tempCourseId = null

module.exports = mongoose.model('Course',CourseSchema)