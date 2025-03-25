import React from 'react';
import StatModal from './StatModal';
import { Bar } from 'react-chartjs-2';

const OnboardingModal = ({ show, onClose, employeeData }) => {
  return (
    <StatModal show={show} onClose={onClose} title="Onboarding Status">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Total Employees</h3>
            <p className="text-3xl font-bold text-purple-600">{employeeData.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Onboarding Completion</h3>
            <p className="text-3xl font-bold text-blue-600">92%</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow h-[300px]">
          <h3 className="text-lg font-semibold mb-4">Onboarding Progress</h3>
          <Bar
            data={{
              labels: ['Documentation', 'Training', 'Equipment', 'Access', 'Introduction'],
              datasets: [{
                label: 'Completion Rate',
                data: [95, 88, 92, 85, 98],
                backgroundColor: 'rgba(147, 51, 234, 0.5)',
                borderColor: 'rgb(147, 51, 234)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: { 
                legend: { position: 'top' }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    stepSize: 20
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </StatModal>
  );
};

export default OnboardingModal; 