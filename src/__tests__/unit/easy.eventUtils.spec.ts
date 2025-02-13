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

describe('generateRepeatEvents', () => {
  describe('반복 유형', () => {
    describe('YEARLY 테스트', () => {
      it('윤년 2월 29일 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: exact)', () => {
        const eventData: Event | EventFormType = {
          id: '312321321312321',
          title: '윤년 기념일',
          date: '2024-02-29',
          startTime: '12:00',
          endTime: '13:00',
          description: '윤년 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'yearly',
            interval: 1,
            endDate: '2032-02-29',
          },
          notificationTime: 10,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'exact'
        );

        expect(repeatEvents).toHaveLength(3);
        expect(repeatEvents[0].date).toBe('2024-02-29');
        expect(repeatEvents[1].date).toBe('2028-02-29');
        expect(repeatEvents[2].date).toBe('2032-02-29');
      });

      it('매년 3월 31일로 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: exact)', () => {
        const eventData: Event | EventFormType = {
          id: '312321321312321',
          title: '3월 31일 기념일',
          date: '2024-03-31',
          startTime: '12:00',
          endTime: '13:00',
          description: '3월 31일 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'yearly',
            interval: 1,
            endDate: '2028-03-31',
          },
          notificationTime: 10,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'exact'
        );

        expect(repeatEvents).toHaveLength(5);
        expect(repeatEvents[0].date).toBe('2024-03-31');
        expect(repeatEvents[1].date).toBe('2025-03-31');
        expect(repeatEvents[2].date).toBe('2026-03-31');
        expect(repeatEvents[3].date).toBe('2027-03-31');
        expect(repeatEvents[4].date).toBe('2028-03-31');
      });

      it('매년 1월 5번째 목요일로 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: nthWeekday)', () => {
        const eventData: Event | EventFormType = {
          id: '312321321312321',
          title: '1월 5번째 목요일 기념일',
          date: '2025-01-30',
          startTime: '12:00',
          endTime: '13:00',
          repeat: {
            type: 'yearly',
            interval: 1,
            endDate: '2028-02-02',
          },
          description: '1월 5번째 목요일 기념일',
          location: '회의실 A',
          category: '업무',
          notificationTime: 10,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'nthWeekday'
        );

        expect(repeatEvents).toHaveLength(2);
        expect(repeatEvents[0].date).toBe('2025-01-30');
        expect(repeatEvents[1].date).toBe('2026-01-29');
      });
    });

    describe('MONTHLY 테스트', () => {
      it('매월 마지막 날 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: lastDay)', () => {
        const eventData: Event | EventFormType = {
          id: '312321321312321',
          title: '윤년 기념일',
          date: '2025-10-31',
          startTime: '12:00',
          endTime: '13:00',
          description: '윤년 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 1,
            endDate: '2025-12-31',
          },
          notificationTime: 10,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'lastDay'
        );

        expect(repeatEvents).toHaveLength(3);
        expect(repeatEvents[0].date).toBe('2025-10-31');
        expect(repeatEvents[1].date).toBe('2025-11-30');
        expect(repeatEvents[2].date).toBe('2025-12-31');
      });

      it('매월 5번째 일요일로 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: nthWeekday)', () => {
        const eventData: Event | EventFormType = {
          id: '312321321312321',
          title: '11월부터 매월 5번째 일요일 기념일',
          date: '2025-11-30',
          startTime: '12:00',
          endTime: '13:00',
          description: '11월부터 매월 5번째 일요일 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 1,
            endDate: '2026-08-31',
          },
          notificationTime: 10,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'nthWeekday'
        );

        expect(repeatEvents).toHaveLength(4);
        expect(repeatEvents[0].date).toBe('2025-11-30');
        expect(repeatEvents[1].date).toBe('2026-03-29');
        expect(repeatEvents[2].date).toBe('2026-05-31');
        expect(repeatEvents[3].date).toBe('2026-08-30');
      });

      it('매월 마지막 주 목요일 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: lastWeekDay)', () => {
        const eventData: Event | EventFormType = {
          id: '312321321312321',
          title: '매월 마지막 주 목요일 기념일',
          date: '2025-10-30',
          startTime: '12:00',
          endTime: '13:00',
          description: '매월 마지막 주 목요일 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 1,
            endDate: '2026-10-30',
          },
          notificationTime: 10,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'lastWeekday'
        );

        expect(repeatEvents).toHaveLength(6);
        expect(repeatEvents[0].date).toBe('2025-10-30');
        expect(repeatEvents[1].date).toBe('2026-01-29');
        expect(repeatEvents[2].date).toBe('2026-02-26');
        expect(repeatEvents[3].date).toBe('2026-04-30');
        expect(repeatEvents[4].date).toBe('2026-07-30');
        expect(repeatEvents[5].date).toBe('2026-10-29');
      });

      it('매월 31일 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: exact)', () => {
        const eventData: Event | EventFormType = {
          id: '312321321312321',
          title: '매월 31일 기념일',
          date: '2025-01-31',
          startTime: '12:00',
          endTime: '13:00',
          description: '매월 31일 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 1,
            endDate: '2025-08-01',
          },
          notificationTime: 10,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'exact'
        );

        expect(repeatEvents).toHaveLength(4);
        expect(repeatEvents[0].date).toBe('2025-01-31');
        expect(repeatEvents[1].date).toBe('2025-03-31');
        expect(repeatEvents[2].date).toBe('2025-05-31');
        expect(repeatEvents[3].date).toBe('2025-07-31');
      });
    });

    describe('WEEKLY 테스트', () => {
      it('매주 반복 일정을 생성할 수 있다.', () => {
        const eventData: Event | EventFormType = {
          id: '987654321',
          title: '주간 회의',
          date: '2025-02-03',
          startTime: '14:00',
          endTime: '15:00',
          description: '팀 주간 회의',
          location: '회의실 C',
          category: '업무',
          repeat: {
            type: 'weekly',
            interval: 1,
            endDate: '2025-03-03',
          },
          notificationTime: 15,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!
        );

        expect(repeatEvents).toHaveLength(5);
        expect(repeatEvents[0].date).toBe('2025-02-03');
        expect(repeatEvents[1].date).toBe('2025-02-10');
        expect(repeatEvents[2].date).toBe('2025-02-17');
        expect(repeatEvents[3].date).toBe('2025-02-24');
        expect(repeatEvents[4].date).toBe('2025-03-03');
      });
    });

    describe('DAILY 테스트', () => {
      it('매일 반복 일정을 생성할 수 있다.', () => {
        const eventData: Event | EventFormType = {
          id: '123456789',
          title: '데일리 스크럼',
          date: '2025-02-01',
          startTime: '10:00',
          endTime: '10:30',
          description: '매일 아침 스크럼 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: {
            type: 'daily',
            interval: 1,
            endDate: '2025-02-05',
          },
          notificationTime: 5,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!
        );

        expect(repeatEvents).toHaveLength(5);
        expect(repeatEvents[0].date).toBe('2025-02-01');
        expect(repeatEvents[1].date).toBe('2025-02-02');
        expect(repeatEvents[2].date).toBe('2025-02-03');
        expect(repeatEvents[3].date).toBe('2025-02-04');
        expect(repeatEvents[4].date).toBe('2025-02-05');
      });
    });
  });
});
