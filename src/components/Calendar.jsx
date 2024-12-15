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
    return <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${colors[type]}`}>{type}</span>;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week days header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center py-2 text-gray-600 font-medium">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {daysInMonth.map((date, idx) => {
          const dayEvents = getEventForDate(date);
          return (
            <div
              key={idx}
              className={`min-h-[100px] p-2 border ${
                isSameMonth(date, currentDate) ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="text-right text-sm text-gray-600">
                {format(date, 'd')}
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.map((event, eventIdx) => (
                  <div key={eventIdx} className="text-sm">
                    {renderEventBadge(event.type)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Events */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Shifts</h3>
        <div className="space-y-3">
          {events.map((event, idx) => (
            <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
              {renderEventBadge(event.type)}
              <span className="text-sm text-gray-600">
                {format(event.date, 'MMM dd, yyyy')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
