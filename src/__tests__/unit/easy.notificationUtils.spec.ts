import { vi } from 'vitest';

import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의',
    date: '2024-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '새새로운 회의',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '새새로운 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getUpcomingEvents', () => {
  beforeAll(() => {
    vi.setSystemTime(new Date(2024, 9, 1, 8, 55));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('시간 기반 필터링', () => {
    it('현재 시각이 (이벤트 시작 시각 - 알림 시간) 이내인 이벤트만 반환한다', () => {
      const result = getUpcomingEvents(mockEvents, new Date(), []);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: '1',
          title: '기존 회의',
          date: '2024-10-01',
          startTime: '09:00',
        })
      );
    });

    it('이벤트 시작 시간이 현재 시각보다 이전인 경우는 제외한다', () => {
      vi.setSystemTime(new Date(2024, 9, 1, 9, 30));

      const result = getUpcomingEvents(mockEvents, new Date(), []);
      expect(result).toHaveLength(0);
    });
  });

  describe('알림 상태 기반 필터링', () => {
    beforeAll(() => {
      vi.setSystemTime(new Date(2024, 9, 15, 8, 55));
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it('이미 알림이 발송된 이벤트는 결과에서 제외한다', () => {
      const result = getUpcomingEvents(mockEvents, new Date(), ['1']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('여러 이벤트 중 알림 조건에 맞는 이벤트만 반환한다', () => {
      const result = getUpcomingEvents(mockEvents, new Date(), ['1']);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: '2',
          title: '새새로운 회의',
          date: '2024-10-15',
        })
      );
    });
  });
});

describe('createNotificationMessage', () => {
  describe('메시지 포맷', () => {
    it('"[알림시간]분 후 [일정제목] 일정이 시작됩니다" 형식으로 메시지를 생성한다', () => {
      const event = mockEvents[0];
      const message = createNotificationMessage(event);
      expect(message).toBe('10분 후 기존 회의 일정이 시작됩니다.');
    });

    it('다른 일정에 대해서도 동일한 포맷으로 메시지를 생성한다', () => {
      const event = mockEvents[1];
      const message = createNotificationMessage(event);
      expect(message).toBe('10분 후 새새로운 회의 일정이 시작됩니다.');
    });
  });
});
