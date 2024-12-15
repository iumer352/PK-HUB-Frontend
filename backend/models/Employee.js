const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance']
  },
  role: {
    type: String,
    required: true
  },
  projects: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  }],
  workSchedule: {
    startTime: {
      type: String,
      default: '9:00 AM'
    },
    endTime: {
      type: String,
      default: '5:00 PM'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
employeeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
