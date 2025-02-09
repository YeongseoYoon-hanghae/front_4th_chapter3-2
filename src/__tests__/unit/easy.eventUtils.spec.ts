import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const createEvent = (overrides = {}): Event => ({
    id: '1',
    title: '기본 회의',
    date: '2024-07-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    ...overrides,
  });

  describe('검색어 필터링', () => {
    it('검색어를 입력하지 않으면 해당 월의 이벤트를 모두 반환한다', () => {
      const events = [createEvent({ date: '2024-07-15', title: '회의' })];

      const result = getFilteredEvents(events, '', new Date(2024, 6, 1), 'month');

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-07-15');
    });

    it('대소문자를 구분하지 않고 "LOWERCASE"를 검색하면 "lowercase"가 제목인 이벤트가 검색된다', () => {
      const events = [createEvent({ date: '2024-09-15', title: 'lowercase' })];

      const result = getFilteredEvents(events, 'LOWERCASE', new Date(2024, 8, 1), 'month');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('lowercase');
    });

    it('"새새로운"으로 검색하면 "새새로운"이 포함된 이벤트만 반환한다', () => {
      const events = [
        createEvent({ date: '2024-10-15', title: '새새로운 회의' }),
        createEvent({ date: '2024-10-15', title: '다른 회의' }),
      ];

      const result = getFilteredEvents(events, '새로운', new Date(2024, 9, 1), 'month');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('새새로운 회의');
    });

    it('이벤트 목록이 비어있으면 빈 배열을 반환한다', () => {
      const result = getFilteredEvents([], '회의', new Date(2024, 9, 1), 'month');

      expect(result).toEqual([]);
    });
  });

  describe('날짜 기반 필터링', () => {
    it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
      const events = [
        createEvent({ date: '2024-07-15', title: '새로운 회의' }),
        createEvent({ date: '2024-08-15', title: '다른 달 회의' }),
      ];

      const result = getFilteredEvents(events, '', new Date(2024, 6, 1), 'month');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          date: '2024-07-15',
          title: '새로운 회의',
        })
      );
    });

    it('주간 뷰에서 2024-07-15 주의 이벤트만 반환한다', () => {
      const events = [createEvent({ date: '2024-07-15' }), createEvent({ date: '2024-07-22' })];

      const result = getFilteredEvents(events, '', new Date(2024, 6, 15), 'week');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          date: '2024-07-15',
        })
      );
    });

    it('9월 말과 10월 초를 포함하는 주에서 해당 주에 속한 이벤트를 모두 반환한다', () => {
      const events = [createEvent({ date: '2024-09-30' }), createEvent({ date: '2024-10-01' })];

      const result = getFilteredEvents(events, '', new Date(2024, 8, 30), 'week');

      expect(result).toHaveLength(2);
    });
  });

  describe('복합 필터링', () => {
    it('2024년 7월 15일이 포함된 주의 이벤트 중 제목에 "새로운"이 포함된 이벤트를 반환한다', () => {
      const events = [
        createEvent({ date: '2024-07-15', title: '새로운 회의' }),
        createEvent({ date: '2024-07-15', title: '일반 회의' }),
      ];

      const result = getFilteredEvents(events, '새로운', new Date(2024, 6, 15), 'week');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          date: '2024-07-15',
          title: '새로운 회의',
        })
      );
    });

    it('2024년 10월의 이벤트 중 제목에 "새로운"이 포함된 이벤트를 반환한다', () => {
      const events = [
        createEvent({ date: '2024-10-15', title: '새새로운 회의' }),
        createEvent({ date: '2024-10-15', title: '일반 회의' }),
      ];

      const result = getFilteredEvents(events, '새로운', new Date(2024, 9, 1), 'month');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          date: '2024-10-15',
          title: '새새로운 회의',
        })
      );
    });
  });
});
