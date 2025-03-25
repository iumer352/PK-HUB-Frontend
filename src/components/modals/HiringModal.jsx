import React from 'react';
import StatModal from './StatModal';
import { Bar } from 'react-chartjs-2';

const HiringModal = ({ show, onClose }) => {
  return (
    <StatModal show={show} onClose={onClose} title="Hiring Statistics">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Overall Hiring Rate</h3>
            <p className="text-3xl font-bold text-purple-600">85%</p>
            <p className="text-sm text-purple-600 mt-2">+3% vs last month</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Average Time to Hire</h3>
            <p className="text-3xl font-bold text-blue-600">21 days</p>
            <p className="text-sm text-blue-600 mt-2">-2 days vs last month</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow h-[300px]">
          <h3 className="text-lg font-semibold mb-4">Hiring Metrics</h3>
          <Bar
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Hiring Rate',
                data: [75, 78, 80, 82, 83, 85],
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

export default HiringModal; 