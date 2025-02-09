import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { Calendar } from '../../../components/calendar/Calendar';
import { renderWithSetup } from '../../test-utils';

describe('Calendar', () => {
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
  ];

  const defaultProps = {
    events: [],
    notifiedEvents: [],
    view: 'month' as const,
    currentDate: new Date(2024, 9, 1),
    holidays: {},
    onViewChange: vi.fn(),
    onNavigate: vi.fn(),
  };

  describe('캘린더 헤더', () => {
    it('제목과 뷰 선택기, 네비게이션 버튼이 표시되어야 한다', () => {
      renderWithSetup(<Calendar {...defaultProps} />);

      expect(screen.getByText('일정 보기')).toBeInTheDocument();
      expect(screen.getByLabelText('view')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous')).toBeInTheDocument();
      expect(screen.getByLabelText('Next')).toBeInTheDocument();
    });
  });

  describe('뷰 전환', () => {
    it('뷰 선택기에서 week를 선택하면 onViewChange가 호출되어야 한다', () => {
      const onViewChange = vi.fn();
      renderWithSetup(<Calendar {...defaultProps} onViewChange={onViewChange} />);

      fireEvent.change(screen.getByLabelText('view'), { target: { value: 'week' } });
      expect(onViewChange).toHaveBeenCalledWith('week');
    });

    it('월간 뷰일 때는 MonthView 컴포넌트가 렌더링되어야 한다', () => {
      renderWithSetup(<Calendar {...defaultProps} events={mockEvents} />);

      expect(screen.getByTestId('month-view')).toBeInTheDocument();
      expect(screen.queryByTestId('week-view')).not.toBeInTheDocument();
    });
  });

  describe('캘린더 네비게이션', () => {
    it('이전 버튼 클릭시 "prev", 다음 버튼 클릭시 "next" 인자와 함께 onNavigate가 호출되어야 한다', () => {
      const onNavigate = vi.fn();
      renderWithSetup(<Calendar {...defaultProps} onNavigate={onNavigate} />);

      fireEvent.click(screen.getByLabelText('Previous'));
      expect(onNavigate).toHaveBeenCalledWith('prev');

      fireEvent.click(screen.getByLabelText('Next'));
      expect(onNavigate).toHaveBeenCalledWith('next');
    });
  });
});
