import { screen, fireEvent } from '@testing-library/react';

import { EventItem } from '../../../components/event/Item';
import { NOTIFICATION_OPTIONS } from '../../../policy';
import { Event, RepeatType } from '../../../types';
import { renderWithSetup } from '../../test-utils';

describe('EventItem 컴포넌트', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-03-15T13:10:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockEvent: Event = {
    id: '1',
    title: '미팅',
    date: '2024-03-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '팀 미팅',
    location: '회의실 A',
    category: '업무',
    notificationTime: 60,
    repeat: {
      type: 'weekly' as RepeatType,
      interval: 1,
      endDate: '2024-06-15',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    event: mockEvent,
    isNotified: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('"미팅" 이벤트 정보가 정확하게 표시되어야 한다', () => {
    renderWithSetup(<EventItem {...defaultProps} />);

    expect(screen.getByText('미팅')).toBeInTheDocument();
    expect(screen.getByText('2024-03-15')).toBeInTheDocument();
    expect(screen.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(screen.getByText('팀 미팅')).toBeInTheDocument();
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
    expect(screen.getByText('카테고리: 업무')).toBeInTheDocument();
    expect(screen.getByText('반복: 1주마다 (종료: 2024-06-15)')).toBeInTheDocument();

    const notificationOption = NOTIFICATION_OPTIONS.find(
      (option) => option.value === mockEvent.notificationTime
    )?.label;
    expect(screen.getByText(`알림: ${notificationOption}`)).toBeInTheDocument();
  });

  describe('알림 상태에 따른 스타일', () => {
    it('알림이 없는 경우 기본 스타일로 표시되어야 한다', () => {
      renderWithSetup(<EventItem {...defaultProps} />);

      expect(screen.queryByLabelText('bell-icon')).not.toBeInTheDocument();
      expect(screen.getByText('미팅')).toHaveClass('chakra-text');
      expect(screen.getByText('미팅')).not.toHaveClass('chakra-text--bold');
      expect(screen.getByText('미팅')).not.toHaveClass('chakra-text--red');
    });

    it('알림이 있는 경우 강조 스타일로 표시되어야 한다', () => {
      renderWithSetup(<EventItem {...defaultProps} isNotified={true} />);
      expect(screen.getByLabelText('bell-icon')).toBeInTheDocument();
      expect(screen.getByLabelText('bell-icon')).toHaveStyle({
        backgroundColor: 'var(--chakra-colors-red-100)',
      });
    });

    it('편집 버튼 클릭시 편집 핸들러가 호출되어야 한다', () => {
      const onEdit = vi.fn();

      renderWithSetup(<EventItem {...defaultProps} onEdit={onEdit} />);

      fireEvent.click(screen.getByLabelText('Edit event'));
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼 클릭시 삭제 핸들러가 호출되어야 한다', () => {
      const onDelete = vi.fn();

      renderWithSetup(<EventItem {...defaultProps} onDelete={onDelete} />);

      fireEvent.click(screen.getByLabelText('Delete event'));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('반복 설정이 없는 경우 반복 정보가 표시되지 않아야 한다', () => {
      const eventWithoutRepeat = {
        ...mockEvent,
        repeat: {
          type: 'none' as RepeatType,
          interval: 0,
        },
      };

      renderWithSetup(<EventItem {...defaultProps} event={eventWithoutRepeat} />);

      expect(screen.queryByText(/반복:/)).not.toBeInTheDocument();
    });
  });
});
