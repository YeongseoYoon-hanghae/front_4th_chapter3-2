import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { EventList } from '../../../components/event/List';
import { renderWithSetup } from '../../test-utils';

describe('EventList', () => {
  const mockEvents = [
    {
      id: '1',
      title: '팀 회의',
      date: '2024-03-20',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2024-03-21',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀 점심',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 0,
    },
  ];

  const defaultProps = {
    events: mockEvents,
    searchTerm: '',
    setSearchTerm: vi.fn(),
    notifiedEvents: [],
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('검색창과 이벤트 목록을 렌더링한다', () => {
    renderWithSetup(<EventList {...defaultProps} />);

    expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getByText('점심 약속')).toBeInTheDocument();
  });

  it('검색어 입력 시 setSearchTerm이 호출된다', async () => {
    const setSearchTerm = vi.fn();
    const user = userEvent.setup();

    renderWithSetup(<EventList {...defaultProps} setSearchTerm={setSearchTerm} />);

    await user.type(screen.getByPlaceholderText('검색어를 입력하세요'), '회의');
    expect(setSearchTerm).toHaveBeenCalledTimes(2);
    expect(setSearchTerm).toHaveBeenNthCalledWith(1, '회');
    expect(setSearchTerm).toHaveBeenNthCalledWith(2, '의');
  });

  it('이벤트가 없을 때 "검색 결과가 없습니다" 메시지를 표시한다', () => {
    renderWithSetup(<EventList {...defaultProps} events={[]} />);

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});
