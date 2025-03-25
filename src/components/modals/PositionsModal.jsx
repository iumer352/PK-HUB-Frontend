import React from 'react';
import StatModal from './StatModal';
import { Doughnut } from 'react-chartjs-2';

const PositionsModal = ({ show, onClose, jobsData }) => {
  return (
    <StatModal show={show} onClose={onClose} title="Positions Overview">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Positions by Status</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Open', 'In Progress', 'Filled'],
                datasets: [{
                  data: [
                    jobsData.openPositions,
                    jobsData.inProgress,
                    jobsData.filled
                  ],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)'
                  ],
                  borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(16, 185, 129, 1)'
                  ],
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      font: { size: 12 },
                      usePointStyle: true
                    }
                  }
                },
                cutout: '60%'
              }}
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between items-center mb-2">
              <span>Total Positions:</span>
              <span className="font-medium">{jobsData.totalPositions}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Open Rate:</span>
              <span className="font-medium">
                {((jobsData.openPositions / jobsData.totalPositions) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Closed Rate:</span>
              <span className="font-medium">
                {(((jobsData.totalPositions - jobsData.openPositions) / jobsData.totalPositions) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </StatModal>
  );
};

export default PositionsModal; 