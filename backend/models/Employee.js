import mongoose from 'mongoose';

// Define the availability schema separately for better modularity
const availabilitySchema = new mongoose.Schema({
    day: {
        type: String,
        required: [true, 'Day is required'],
        enum: {
            values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            message: '{VALUE} is not a valid day'
        }
    },
    time: {
        type: String,
        required: [true, 'Time slot is required'],
        validate: {
            validator: function(v) {
                // Basic time format validation (e.g., "9:00 AM - 5:00 PM")
                return /^([1-9]|1[0-2]):[0-5][0-9]\s(?:AM|PM)\s-\s([1-9]|1[0-2]):[0-5][0-9]\s(?:AM|PM)$/.test(v);
            },
            message: props => `${props.value} is not a valid time format! Use format like "9:00 AM - 5:00 PM"`
        }
    }
}, {
    _id: false // Prevents generating separate IDs for availability subdocuments
});

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['Developer', 'Manager', 'Designer', 'QA'],
            message: '{VALUE} is not a valid role'
        },
        index: true // Index for better query performance
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        trim: true
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'On Leave', 'Terminated'],
            message: '{VALUE} is not a valid status'
        },
        default: 'Active',
        index: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true,
        index: true
    },
    joinDate: {
        type: Date,
        required: [true, 'Join date is required'],
        default: Date.now
    },
    availability: {
        type: [availabilitySchema],
        validate: {
            validator: function(v) {
                // Ensure no duplicate days in availability
                const days = v.map(slot => slot.day);
                return new Set(days).size === days.length;
            },
            message: 'Duplicate days in availability are not allowed'
        }
    },
    skills: [{
        type: String,
        trim: true
    }],
    phoneNumber: {
        type: String,
        validate: {
            validator: function(v) {
                // Basic phone number validation
                return /^\+?[\d\s-]{10,}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Include virtuals when document is converted to JSON
    toObject: { virtuals: true }
});

// Virtual for employee's full experience
employeeSchema.virtual('experience').get(function() {
    return Math.floor((new Date() - this.joinDate) / (1000 * 60 * 60 * 24 * 365));
});

// Index for text search on name and position
employeeSchema.index({ name: 'text', position: 'text' });

// Compound index for department and role queries
employeeSchema.index({ department: 1, role: 1 });

// Pre-save middleware to ensure email is lowercase
employeeSchema.pre('save', function(next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase();
    }
    next();
});

// Static method to find active employees by department
employeeSchema.statics.findActiveByDepartment = function(department) {
    return this.find({ department, status: 'Active' });
};

// Instance method to update status
employeeSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    return this.save();
};

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
