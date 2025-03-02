import React, { useState, useEffect } from 'react';
import { Plus, Users, Briefcase, Calendar, ArrowLeft, CheckCircle } from 'lucide-react';
import NewProjectForm from './NewProjectForm';
import ProjectDetails from './ProjectDetails';

const ProjectDashboard = () => {
  const [view, setView] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    deadline: '',
    assignees: []
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-purple-100 text-purple-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Completed': 'bg-green-100 text-green-700',
      'On Hold': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateProject = async (projectData) => {
    if (!projectData.name || !projectData.description || !projectData.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      await fetchProjects();
      setView('projects');
    } catch (err) {
      setError(err.message);
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
    } catch (err) {
      setError(err.message);
      console.error('Error updating project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
        setView('projects');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEmployee = async (projectId, employeeId) => {
    if (!employeeId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign employee');
      }

      // Refresh the projects to get the updated data
      await fetchProjects();
      
      // Get the updated project and set it as selected
      const projectResponse = await fetch(`http://localhost:5000/api/projects/${projectId}`);
      if (projectResponse.ok) {
        const updatedProject = await projectResponse.json();
        setSelectedProject(updatedProject);
      }
      
      setSelectedEmployee('');
    } catch (err) {
      setError(err.message);
      console.error('Error assigning employee:', err);
    }
  };

  const ProjectList = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map(project => (
        <div 
          key={project.id} 
          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">{formatDate(project.deadline)}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm">{project.assignees.length} team members</span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500">Progress</span>
                  <span className="text-sm font-medium text-gray-500">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setSelectedProject(project);
                setView('projectDetails');
              }}
              className="mt-6 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderView = () => {
    switch (view) {
      case 'projects':
        return <ProjectList />;
      case 'newProject':
        return <NewProjectForm 
          onSubmit={handleCreateProject}
          onCancel={() => setView('projects')}
          loading={loading}
        />;
      case 'projectDetails':
        return <ProjectDetails 
          project={selectedProject}
          employees={employees}
          onBack={() => {
            setSelectedProject(null);
            setView('projects');
          }}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
          onAssignEmployee={handleAssignEmployee}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
        />;
      default:
        return <ProjectList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
        {view === 'projects' && (
          <button 
            onClick={() => setView('newProject')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        renderView()
      )}
    </div>
  );
};

export default ProjectDashboard;