const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

// Import routes
const applicantRoutes = require('./routes/applicantRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const projectRoutes = require('./routes/projectRoutes');
const interviewerRoutes = require('./routes/interviewerRoutes');
const stageLookupRoutes = require('./routes/stageLookupRoutes');

// Import model associations
require('./models/associations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applicant', applicantRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/interviewers', interviewerRoutes);
app.use('/api/stages', stageLookupRoutes);


// Sync database and start server
const startServer = async () => {
  try {
    // Drop all tables and recreate them
    await sequelize.sync();
    console.log('Database synchronized - all tables dropped and recreated');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

startServer();