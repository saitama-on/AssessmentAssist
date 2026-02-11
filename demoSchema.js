const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Base schema for all question types
const baseQuestionSchema = {
  type: {
    type: String,
    enum: ['mcq', 'ordering', 'hotspot'],
    required: true
  },
  purpose: {
    type: String,
    enum: ['formative', 'summative'],
    required: true
  },
  stem: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  learningObjective: {
    type: String,
    trim: true,
    required: function() {
      return this.purpose === 'summative';
    }
  },
  bloomsLevel: {
    type: String,
    enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
    required: function() {
      return this.purpose === 'summative';
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
};

// MCQ Option Schema
const mcqOptionSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  feedback: {
    type: String,
    trim: true,
    required: function() {
      // For formative questions, feedback is required for all options
      return this.parent().purpose === 'formative';
    }
  }
}, { _id: true });

// Ordering Item Schema
const orderingItemSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true
  }
}, { _id: true });

// Hotspot Zone Schema
const hotspotZoneSchema = new Schema({
  coordinates: [{
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  }],
  label: {
    type: String,
    trim: true
  }
}, { _id: true });

// Main Question Schema with discriminator
const questionSchema = new Schema({
  ...baseQuestionSchema,
  // MCQ specific fields
  options: [{
    type: mcqOptionSchema,
    validate: {
      validator: function(options) {
        return this.type === 'mcq' ? options.length >= 2 : true;
      },
      message: 'MCQ questions must have at least 2 options'
    }
  }],
  // Ordering specific fields
  items: [{
    type: orderingItemSchema,
    validate: {
      validator: function(items) {
        return this.type === 'ordering' ? items.length >= 2 : true;
      },
      message: 'Ordering questions must have at least 2 items'
    }
  }],
  // Hotspot specific fields
  zones: [{
    type: hotspotZoneSchema,
    validate: {
      validator: function(zones) {
        return this.type === 'hotspot' ? zones.length >= 1 : true;
      },
      message: 'Hotspot questions must have at least 1 zone'
    }
  }],
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        return !url || /^https?:\/\/.+/.test(url);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL'
    }
  }
}, {
  timestamps: true,
  discriminatorKey: 'type'
});

//Example fronted request body for mcq question
// {
//   "type": "mcq",
//   "purpose": "formative",
//   "stem": "Which of the following is a primary color in the additive (RGB) color model?",
//   "topic": "Color Theory",
//   "createdBy": "65ab4f2e9c1234567890abcd",
//   "tags": ["design", "basics"],
//   "options": [
//     {
//       "text": "Red",
//       "isCorrect": true,
//       "feedback": "Correct! Red, Green, and Blue are the primary colors of light."
//     },
//     {
//       "text": "Yellow",
//       "isCorrect": false,
//       "feedback": "Incorrect. Yellow is a primary color in subtractive (RYB) models, but not RGB."
//     },
//     {
//       "text": "Black",
//       "isCorrect": false,
//       "feedback": "Incorrect. Black is the absence of light."
//     }
//   ]
// }




// Pre-save validation
questionSchema.pre('save', function(next) {

    //if the question is of type mcq, then check if there is exactly one correct option
  if (this.type === 'mcq') {
    const correctOptions = this.options.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      return next(new Error('MCQ questions must have exactly one correct option'));
    }
    
    // Check formative feedback requirement
    // if the question is of type formative, then feedback is required for all options
    if (this.purpose === 'formative') {
      const missingFeedback = this.options.some(opt => !opt.feedback);
      if (missingFeedback) {
        return next(new Error('Formative MCQ questions must have feedback for all options'));
      }
    }
  }
  
  if (this.type === 'ordering') {
    // Check if order numbers are sequential
    //allow 0,1,2,3 but not 1 5 10
    const orders = this.items.map(item => item.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i) {
        return next(new Error('Ordering items must have sequential order numbers starting from 0'));
      }
    }
  }
  
  next();
});


const Question = mongoose.model('Question', questionSchema);


module.exports = {
  Question,
  mcqOptionSchema,
  orderingItemSchema,
  hotspotZoneSchema
};