import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const OnboardingChecklist = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [checklist, setChecklist] = useState([
    {
      id: 1,
      task: "Fill, sign and return the onboarding documents to HR",
      completed: false,
    },
    {
      id: 2,
      task: "Complete and submit KICS form",
      completed: false,
    },
    {
      id: 3,
      task: "Prepare brief introduction for DLH weekly meeting",
      completed: false,
    },
    {
      id: 4,
      task: "Develop and share Saudi resume template",
      email: {
        to: "thomasyoung1@kpmg.com",
        cc: ["shahbazhaque@kpmg.com", "YButt@kpmg.com"],
      },
      completed: false,
    },
    {
      id: 5,
      task: "Develop and share Pakistan resume template",
      email: {
        to: "YButt@kpmg.com",
      },
      completed: false,
    },
    {
      id: 6,
      task: "Request bonafide letter for Bank account opening",
      email: {
        to: ["hibamubashir@kpmg.com", "Madnan2@kpmg.com"],
        cc: ["YButt@kpmg.com"],
      },
      completed: false,
    },
    {
      id: 7,
      task: "Request EPMS code",
      email: {
        to: "hibamubashir@kpmg.com",
        cc: ["mominatouqir@kpmg.com", "YButt@kpmg.com"],
      },
      completed: false,
    },
    {
      id: 8,
      task: "Get EPMS Saudi code (Client: KPMG Saudia, KPMG KSA MFE-ITA Secondments-2023, Lead ID: 210018050)",
      email: {
        to: "YButt@kpmg.com",
      },
      completed: false,
    },
    {
      id: 9,
      task: "Request Training portal (GLMS) access",
      email: {
        to: "hibamubashir@kpmg.com",
        cc: ["mominatouqir@kpmg.com", "YButt@kpmg.com"],
      },
      completed: false,
    },
    {
      id: 10,
      task: "Complete all mandatory trainings on GLMS",
      completed: false,
    },
    {
      id: 11,
      task: "Request timesheet access",
      email: {
        to: "aimenaslam@kpmg.com",
        cc: ["YButt@kpmg.com"],
      },
      completed: false,
    },
    {
      id: 12,
      task: "Setup Mobile Email/Teams",
      email: {
        to: "JRasool@kpmg.com",
        note: "Requires approval from Yousuf Butt",
      },
      completed: false,
    },
    {
      id: 13,
      task: "Request required software/tools",
      email: {
        to: "JRasool@kpmg.com",
        note: "Requires approval from project manager and Yousuf Butt",
      },
      completed: false,
    },
    {
      id: 14,
      task: "Access to sharepoint sites (will be added by lighthouse team)",
      completed: false,
    },
  ]);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`/api/employees/${employeeId}`);
        setEmployee(response.data);
      } catch (error) {
        console.error('Error fetching employee:', error);
        alert('Failed to fetch employee details');
      }
    };

    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const handleCheckboxChange = (id) => {
    setChecklist(prevChecklist =>
      prevChecklist.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const composeEmail = (item) => {
    if (!item.email) return;
    
    const { to, cc, note } = item.email;
    const subject = encodeURIComponent(`Onboarding Task: ${item.task}`);
    const body = encodeURIComponent(`Hello,\n\nI am writing regarding the following onboarding task: ${item.task}\n\n${note ? `Note: ${note}\n\n` : ''}Best regards,\n${employee?.name}`);
    
    const mailtoLink = `mailto:${Array.isArray(to) ? to.join(',') : to}${cc ? `?cc=${Array.isArray(cc) ? cc.join(',') : cc}` : ''}${`&subject=${subject}&body=${body}`}`;
    
    window.location.href = mailtoLink;
  };

  const progress = Math.round((checklist.filter(item => item.completed).length / checklist.length) * 100);

  if (!employee) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome {employee.name}!</h1>
          <p className="text-lg text-gray-600">Complete your onboarding checklist to get started</p>
        </div>
        
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg font-medium">Progress: {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <ul className="space-y-3">
          {checklist.map(item => (
            <li 
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleCheckboxChange(item.id)}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className={`${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {item.task}
                </span>
              </div>
              {item.email && (
                <button
                  onClick={() => composeEmail(item)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Mail className="w-4 h-4" />
                  <span>Compose Email</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OnboardingChecklist;
