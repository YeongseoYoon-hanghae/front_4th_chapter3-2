import { screen } from '@testing-library/react';

import { MonthView } from '../../../components/calendar/MonthView';
import { WEEK_DAYS } from '../../../policy';
import { Event } from '../../../types';
import { renderWithSetup } from '../../test-utils';

describe('MonthView', () => {
  const mockDate = new Date(2024, 9, 1);
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '미팅',
      date: mockDate.toISOString(),
      startTime: '10:00',
      endTime: '11:00',
      description: '미팅 설명',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심약속',
      date: mockDate.toISOString(),
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 약속 설명',
      location: '',
      category: '',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 10,
    },
  ];

  const mockHolidays = {
    '2024-10-03': '개천절',
    '2024-10-09': '한글날',
  };

  it('월간 뷰에 2024년 10월이 표시되어야 한다', () => {
    renderWithSetup(
      <MonthView currentDate={mockDate} events={[]} notifiedEvents={[]} holidays={{}} />
    );

    expect(screen.getByText('2024년 10월')).toBeInTheDocument();
  });

  it('일, 월, 화, 수, 목, 금,토요일이 올바르게 표시되어야 한다', () => {
    renderWithSetup(
      <MonthView currentDate={mockDate} events={[]} notifiedEvents={[]} holidays={{}} />
    );

    WEEK_DAYS.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('개천절과 한글날이 공휴일로 표시되어야 한다', () => {
    renderWithSetup(
      <MonthView currentDate={mockDate} events={[]} notifiedEvents={[]} holidays={mockHolidays} />
    );

    const holidays = screen.getAllByLabelText('holiday');
    expect(holidays).toHaveLength(2);
    expect(holidays[0]).toHaveTextContent('개천절');
    expect(holidays[1]).toHaveTextContent('한글날');
  });

  it('"미팅", "점심약속"만 일정으로 표시되어야 한다', () => {
    renderWithSetup(
      <MonthView currentDate={mockDate} events={mockEvents} notifiedEvents={[]} holidays={{}} />
    );

    const firstDayCell = screen.getByText('1').closest('td');
    expect(firstDayCell).toHaveTextContent('미팅');
    expect(firstDayCell).toHaveTextContent('점심약속');
  });
});
