import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';

const EmployeeMonthlyView = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch employee data
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`);
        if (!response.ok) throw new Error('Failed to fetch employee data');
        const data = await response.json();
        setEmployee(data);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setError('Failed to load employee data. Please try again later.');
      }
    };

    // Fetch employee availability
    const fetchAvailability = async () => {
      try {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        const response = await fetch(`http://localhost:5000/api/employees/${employeeId}/availabilities?startDate=${format(start, 'yyyy-MM-dd')}&endDate=${format(end, 'yyyy-MM-dd')}`);
        if (!response.ok) throw new Error('Failed to fetch availability');
        const data = await response.json();
        setAvailability(data.availability);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setError('Failed to load availability data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
    fetchAvailability();
  }, [employeeId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{employee.name}'s Monthly Schedule</h1>
      <div className="grid grid-cols-7 gap-1">
        {availability.map((day, index) => (
          <div key={index} className="border p-2">
            <span className="block font-bold">{format(new Date(day.date), 'd')}</span>
            {day.projects.map((project, idx) => (
              <div key={idx} className="text-sm bg-green-100 p-1 mt-1 rounded">
                {project.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeMonthlyView;
