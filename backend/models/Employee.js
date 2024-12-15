import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  time: {
    type: String,
    required: true
  }
});

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  availability: [availabilitySchema]
}, {
  timestamps: true
});

// Indexes for better query performance
employeeSchema.index({ name: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ 'availability.day': 1 });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
