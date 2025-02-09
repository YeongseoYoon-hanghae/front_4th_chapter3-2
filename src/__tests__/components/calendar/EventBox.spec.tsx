import { screen } from '@testing-library/react';

import { EventBox } from '../../../components/calendar/EventBox';
import { renderWithSetup } from '../../test-utils';

describe('EventBox', () => {
  const mockEvent = {
    id: '1',
    title: '미팅',
    date: '2024-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '미팅 설명',
    location: '',
    category: '',
    repeat: { type: 'none' as const, interval: 1 },
    notificationTime: 10,
  };

  it('이벤트 제목이 표시되어야 한다', () => {
    renderWithSetup(<EventBox event={mockEvent} isNotified={false} />);
    expect(screen.getByText('미팅')).toBeInTheDocument();
  });

  describe('알림 상태에 따른 스타일', () => {
    it('알림이 없는 경우 기본 스타일로 표시되어야 한다', () => {
      renderWithSetup(<EventBox event={mockEvent} isNotified={false} />);
      const eventBox = screen.getByLabelText('event-box');

      expect(eventBox).toHaveStyle({
        backgroundColor: 'var(--chakra-colors-gray-100)',
      });
      expect(screen.queryByLabelText('bell-icon')).not.toBeInTheDocument();
    });

    it('알림이 있는 경우 강조 스타일로 표시되어야 한다', () => {
      renderWithSetup(<EventBox event={mockEvent} isNotified={true} />);
      const eventBox = screen.getByLabelText('event-box');

      expect(eventBox).toHaveStyle({
        backgroundColor: 'var(--chakra-colors-red-100)',
      });
      expect(screen.getByLabelText('bell-icon')).toBeInTheDocument();
    });
  });

  it('이벤트 제목이 한 줄로 제한되어 표시되어야 한다', () => {
    const longTitleEvent = {
      ...mockEvent,
      id: '3',
      title: '매우 긴 제목의 이벤트입니다. 이것은 한 줄을 넘어가야 합니다.',
    };

    renderWithSetup(<EventBox event={longTitleEvent} isNotified={false} />);

    const eventTitle = screen.getByText(longTitleEvent.title);
    expect(eventTitle).toHaveStyle({ textOverflow: 'ellipsis' });
  });
});
