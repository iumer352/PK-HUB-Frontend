import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState([
    { date: new Date(2024, 11, 15), type: 'Q1', employeeId: '1' },
    { date: new Date(2024, 11, 16), type: 'Q2', employeeId: '2' },
    { date: new Date(2024, 11, 17), type: 'Q3', employeeId: '3' },
  ]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventForDate = (date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const renderEventBadge = (type) => {
    const colors = {
      Q1: 'bg-red-200 text-red-800',
      Q2: 'bg-green-200 text-green-800',
      Q3: 'bg-blue-200 text-blue-800',
    };
    return <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${colors[type]}`}>{type}</span>;
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
        <p className="text-gray-600">View and manage employee schedules</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 h-[calc(100vh-200px)] flex flex-col">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={prevMonth} 
            className="p-3 md:p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 ease-in-out active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{format(currentDate, 'MMMM yyyy')}</h2>
          <button 
            onClick={nextMonth} 
            className="p-3 md:p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 ease-in-out active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 gap-1 text-center overflow-y-auto">
          {/* Week Days */}
          <div className="col-span-7 grid grid-cols-7 sticky top-0 bg-white z-10 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-gray-500 font-semibold uppercase text-sm">
                {day}
              </div>
            ))}
          </div>
          {/* Days */}
          {daysInMonth.map((date, idx) => {
            const dayEvents = getEventForDate(date);
            return (
              <div 
                key={idx} 
                className={`p-2 border rounded-lg text-gray-700 ${
                  isSameMonth(date, currentDate) ? 'bg-white' : 'bg-gray-100 text-gray-400'
                } hover:shadow-md transition min-h-[100px] flex flex-col`}
              >
                <div className="text-right text-xs font-semibold mb-1">
                  {format(date, 'd')}
                </div>
                {/* Events */}
                <div className="flex-1 space-y-1">
                  {dayEvents.map((event, eventIdx) => (
                    <div key={eventIdx} className="flex justify-center">
                      {renderEventBadge(event.type)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Events */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Upcoming Shifts</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Add Shift
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map((event, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {renderEventBadge(event.type)}
                <span className="text-gray-700 text-sm font-medium">
                  {format(event.date, 'EEE, MMM dd, yyyy')}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
