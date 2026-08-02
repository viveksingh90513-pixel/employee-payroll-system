import { useState } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import LoadingSpinner from '../common/LoadingSpinner';

const MonthlyCalendar = ({ employeeId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data, loading } = useFetch('/attendance/calendar', {
    params: { month, year, employeeId }
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  // Generate calendar grid days
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun

  const recordsMap = {};
  if (data?.records) {
    data.records.forEach(r => {
      const dayNum = new Date(r.date).getDate();
      recordsMap[dayNum] = r;
    });
  }

  const calendarDays = [];
  // Empty slots for padding before 1st of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Days 1 to N
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <Card className="border-0 shadow-sm rounded-3 mb-4">
      <Card.Header className="bg-white border-0 p-4 pb-0 d-flex align-items-center justify-content-between">
        <div>
          <h5 className="font-weight-bold text-dark mb-0">Monthly Attendance Calendar</h5>
          <p className="text-muted small mb-0">{monthNames[month - 1]} {year}</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="p-1 px-2 border">
            <HiOutlineChevronLeft /> Prev
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNextMonth} className="p-1 px-2 border">
            Next <HiOutlineChevronRight />
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-4">
        {/* Legend */}
        <div className="d-flex flex-wrap gap-3 mb-4 p-2 bg-light rounded-3 small">
          <div className="d-flex align-items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span> Present</div>
          <div className="d-flex align-items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span> Late Entry</div>
          <div className="d-flex align-items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316' }}></span> Early Exit</div>
          <div className="d-flex align-items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1' }}></span> Overtime</div>
          <div className="d-flex align-items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span> Absent</div>
          <div className="d-flex align-items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></span> On Leave</div>
        </div>

        {loading ? (
          <div className="text-center py-5"><LoadingSpinner /></div>
        ) : (
          <div className="calendar-grid">
            {/* Days Header */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center font-weight-bold text-muted small py-2 border-bottom">
                {d}
              </div>
            ))}

            {/* Days Grid */}
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="calendar-day bg-gray-50 border-bottom border-right p-2 opacity-25"></div>;
              }

              const rec = recordsMap[day];
              const isSunday = (firstDayOfWeek + day - 1) % 7 === 0;

              return (
                <div 
                  key={day} 
                  className={`calendar-day border-bottom border-right p-2 style-card ${isSunday ? 'bg-light' : ''}`}
                  style={{ minHeight: '85px' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className={`fw-bold small ${isSunday ? 'text-muted' : 'text-dark'}`}>{day}</span>
                    {rec && (
                      <span className={`status-dot status-dot-${rec.status}`} title={rec.status}></span>
                    )}
                  </div>

                  {rec ? (
                    <div className="d-flex flex-column gap-1">
                      <Badge 
                        bg={
                          rec.status === 'present' ? 'success' :
                          rec.status === 'late' ? 'warning' :
                          rec.status === 'on-leave' ? 'primary' :
                          rec.status === 'absent' ? 'danger' : 'secondary'
                        } 
                        className="p-1 px-1.5 text-truncate"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {rec.check_in ? rec.check_in.substring(0, 5) : rec.status}
                      </Badge>

                      {rec.late_minutes > 0 && (
                        <span className="badge bg-warning-light text-warning-dark p-0.5" style={{ fontSize: '0.6rem' }}>
                          +{rec.late_minutes}m Late
                        </span>
                      )}
                      {rec.overtime_hours > 0 && (
                        <span className="badge bg-indigo-light text-indigo-dark p-0.5" style={{ fontSize: '0.6rem' }}>
                          +{rec.overtime_hours}h OT
                        </span>
                      )}
                    </div>
                  ) : (
                    isSunday && <span className="text-muted" style={{ fontSize: '0.65rem' }}>Weekend</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card.Body>

      <style>{`
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-left: 1px solid #e5e7eb;
          border-top: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .calendar-day {
          background: #ffffff;
          transition: background 0.2s ease;
        }
        .calendar-day:hover {
          background: #f9fafb;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .status-dot-present { background: #10b981; }
        .status-dot-late { background: #f59e0b; }
        .status-dot-absent { background: #ef4444; }
        .status-dot-on-leave { background: #3b82f6; }
      `}</style>
    </Card>
  );
};

export default MonthlyCalendar;
