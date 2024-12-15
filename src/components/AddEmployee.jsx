import React, { useState } from 'react';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    position: '',
    availability: []
  });

  const [availabilityInputs, setAvailabilityInputs] = useState([
    { day: '', time: '' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    const newAvailability = [...availabilityInputs];
    newAvailability[index][field] = value;
    setAvailabilityInputs(newAvailability);
  };

  const addAvailabilitySlot = () => {
    setAvailabilityInputs(prev => [...prev, { day: '', time: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      availability: availabilityInputs.filter(slot => slot.day && slot.time)
    };

    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        alert('Employee added successfully!');
        setFormData({
          name: '',
          role: '',
          position: '',
          availability: []
        });
        setAvailabilityInputs([{ day: '', time: '' }]);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error adding employee. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Employee</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Enter the employee details and their availability schedule.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1">
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Developer">Developer</option>
                  <option value="Manager">Manager</option>
                  <option value="Designer">Designer</option>
                  <option value="QA">QA</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="position"
                  id="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Availability
              </label>
              <div className="mt-2 space-y-4">
                {availabilityInputs.map((slot, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-1">
                      <select
                        value={slot.day}
                        onChange={(e) => handleAvailabilityChange(index, 'day', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="e.g., 9:00 AM - 5:00 PM"
                        value={slot.time}
                        onChange={(e) => handleAvailabilityChange(index, 'time', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAvailabilitySlot}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add More Availability
                </button>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', role: '', position: '', availability: [] });
                    setAvailabilityInputs([{ day: '', time: '' }]);
                  }}
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Add Employee
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
