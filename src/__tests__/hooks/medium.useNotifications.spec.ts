import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-07-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([]));

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('알림 시간이 되면 알림이 새롭게 생성되어 추가된다', async () => {
    const event: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2024-07-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '팀 주간 미팅',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 30,
    };

    const { result } = renderHook(() => useNotifications([event]));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '1',
      message: '30분 후 팀 미팅 일정이 시작됩니다.',
    });
  });

  it('특정 알림을 제거하면 해당 알림만 제거되고 다른 알림은 유지되어야 한다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 미팅',
        date: '2024-07-15',
        startTime: '10:30',
        endTime: '11:30',
        description: '팀 주간 미팅',
        location: '회의실 A',
        category: '회의',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 30,
      },
      {
        id: '2',
        title: '고객 미팅',
        date: '2024-07-15',
        startTime: '10:30',
        endTime: '11:30',
        description: '고객 미팅',
        location: '회의실 B',
        category: '미팅',
        repeat: {
          type: 'daily',
          interval: 1,
        },
        notificationTime: 30,
      },
    ];

    const { result } = renderHook(() => useNotifications(events));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '30분 후 팀 미팅 일정이 시작됩니다.',
      },
      {
        id: '2',
        message: '30분 후 고객 미팅 일정이 시작됩니다.',
      },
    ]);

    await act(async () => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '2',
      message: '30분 후 고객 미팅 일정이 시작됩니다.',
    });
  });

  it('이미 알림이 발생한 이벤트는 다시 알림이 발생하지 않는다', async () => {
    const event: Event = {
      id: '1',
      title: '팀 미팅',
      date: '2024-07-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '팀 주간 미팅',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 30,
    };

    const { result } = renderHook(() => useNotifications([event]));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifications).toHaveLength(1);

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');
  });
});
