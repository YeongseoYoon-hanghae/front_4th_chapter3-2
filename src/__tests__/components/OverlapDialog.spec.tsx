import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { OverlapDialog } from '../../components/OverlapDialog';
import { Event } from '../../types';
import { renderWithSetup } from '../test-utils';

describe('OverlapDialog', () => {
  const mockEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2024-03-20',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    overlappingEvents: [mockEvent],
    cancelRef: { current: null },
    onConfirm: vi.fn(),
  };

  it('다이얼로그가 열려있을 때 중복된 일정 정보를 보여준다', () => {
    renderWithSetup(<OverlapDialog {...defaultProps} />);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(
      screen.getByText(
        `${mockEvent.title} (${mockEvent.date} ${mockEvent.startTime}-${mockEvent.endTime})`
      )
    ).toBeInTheDocument();
  });

  it('다이얼로그가 닫혀있을 때는 렌더링되지 않는다', () => {
    renderWithSetup(<OverlapDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });

  it('여러 개의 중복 일정을 모두 표시한다', () => {
    const multipleEvents = [
      mockEvent,
      {
        ...mockEvent,
        id: '2',
        title: '팀 미팅',
        startTime: '14:30',
        endTime: '15:30',
      },
    ];

    renderWithSetup(<OverlapDialog {...defaultProps} overlappingEvents={multipleEvents} />);

    multipleEvents.forEach((event) => {
      expect(
        screen.getByText(`${event.title} (${event.date} ${event.startTime}-${event.endTime})`)
      ).toBeInTheDocument();
    });
  });

  it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithSetup(<OverlapDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByText('취소'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('계속 진행 버튼 클릭 시 onConfirm이 호출된다', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    renderWithSetup(<OverlapDialog {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByText('계속 진행'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('ESC 키를 누르면 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderWithSetup(<OverlapDialog {...defaultProps} onClose={onClose} />);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
