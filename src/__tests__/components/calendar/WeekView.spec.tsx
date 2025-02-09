import { screen } from '@testing-library/react';

import { WeekView } from '../../../components/calendar/WeekView';
import { WEEK_DAYS } from '../../../policy';
import { renderWithSetup } from '../../test-utils';

describe('WeekView', () => {
  const mockDate = new Date(2024, 9, 1);

  const mockEvents = [
    {
      id: '1',
      title: '미팅',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심약속',
      date: '2024-10-03',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 10,
    },
  ];

  it('주간 뷰의 헤더에 2024년 10월 1주가 표시되어야 한다', () => {
    renderWithSetup(<WeekView currentDate={mockDate} events={[]} notifiedEvents={[]} />);

    expect(screen.getByText('2024년 10월 1주')).toBeInTheDocument();
  });

  it('일, 월, 화, 수, 목, 금,토요일이 올바르게 표시되어야 한다', () => {
    renderWithSetup(<WeekView currentDate={mockDate} events={[]} notifiedEvents={[]} />);

    WEEK_DAYS.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('2024년 10월 1주의 모든 날짜가 표시되어야 한다', () => {
    renderWithSetup(<WeekView currentDate={mockDate} events={[]} notifiedEvents={[]} />);

    const expectedDates = ['29', '30', '1', '2', '3', '4', '5'];
    expectedDates.forEach((date) => {
      expect(screen.getByText(date)).toBeInTheDocument();
    });
  });

  it('"미팅", "점심약속"만 일정으로 표시되어야 한다', () => {
    renderWithSetup(<WeekView currentDate={mockDate} events={mockEvents} notifiedEvents={[]} />);

    const eventBoxes = screen.getAllByLabelText('event-box');
    expect(eventBoxes).toHaveLength(2);

    expect(screen.getByText('미팅')).toBeInTheDocument();
    expect(screen.getByText('점심약속')).toBeInTheDocument();
  });
});
