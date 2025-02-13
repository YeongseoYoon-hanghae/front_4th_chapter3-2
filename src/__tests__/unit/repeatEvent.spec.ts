import { Event } from '../../types';
import { generateRepeatEvents } from '../../utils/repeatUtils';

const createEventData = (overrides: Partial<Event> = {}): Event => ({
  id: '123456789',
  title: '테스트 일정',
  date: '2025-02-01',
  startTime: '10:00',
  endTime: '10:30',
  description: '테스트 설명',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2025-02-05',
  },
  notificationTime: 5,
  ...overrides,
});

const verifyDates = (events: Event[], expectedDates: string[]) => {
  expect(events).toHaveLength(expectedDates.length);
  events.forEach((event, index) => {
    expect(event.date).toBe(expectedDates[index]);
  });
};

describe('generateRepeatEvents', () => {
  describe('반복 유형별 테스트', () => {
    describe('연간 반복', () => {
      it('윤년(2월 29일) 반복 일정 생성', () => {
        const event = createEventData({
          date: '2024-02-29',
          repeat: {
            type: 'yearly',
            interval: 1,
            endDate: '2032-02-29',
          },
        });

        const repeatEvents = generateRepeatEvents(
          event,
          event.repeat.type,
          event.repeat.interval,
          event.repeat.endDate!,
          'exact'
        );

        verifyDates(repeatEvents, ['2024-02-29', '2028-02-29', '2032-02-29']);
      });

      it('매년 3월 31일로 반복 일정을 생성할PATTERN: exact)', () => {
        const eventData: Event = {
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

      it('매년 1월 5번째 목요일로 반복 일정을EAT_PATTERN: nthWeekday)', () => {
        const eventData: Event = {
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

    describe('월간 반복', () => {
      it('매월 마지막 날 반복', () => {
        const event = createEventData({
          date: '2025-10-31',
          repeat: {
            type: 'monthly',
            interval: 1,
            endDate: '2025-12-31',
          },
        });

        const repeatEvents = generateRepeatEvents(
          event,
          event.repeat.type,
          event.repeat.interval,
          event.repeat.endDate!,
          'lastDay'
        );

        verifyDates(repeatEvents, ['2025-10-31', '2025-11-30', '2025-12-31']);
      });

      it('매월 5번째 일요일로 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: nthWeekday)', () => {
        const eventData: Event = {
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

      it('매월 마지막 목요일 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: lastWeekDay)', () => {
        const eventData: Event = {
          id: '312321321312321',
          title: '매월 마지막 목요일 기념일',
          date: '2025-10-30',
          startTime: '12:00',
          endTime: '13:00',
          description: '매월 마지막 목요일 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 1,
            endDate: '2026-02-26',
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

        expect(repeatEvents).toHaveLength(5);
        expect(repeatEvents[0].date).toBe('2025-10-30');
        expect(repeatEvents[1].date).toBe('2025-11-27');
        expect(repeatEvents[2].date).toBe('2025-12-25');
        expect(repeatEvents[3].date).toBe('2026-01-29');
        expect(repeatEvents[4].date).toBe('2026-02-26');
      });

      it('매월 마지막 금요일 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: lastWeekDay)', () => {
        const eventData: Event = {
          id: '312321321312321',
          title: '매월 마지막 금요일 기념일',
          date: '2025-02-28',
          startTime: '12:00',
          endTime: '13:00',
          description: '매월 마지막 금요일 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 1,
            endDate: '2025-05-02',
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

        expect(repeatEvents).toHaveLength(3);
        expect(repeatEvents[0].date).toBe('2025-02-28');
        expect(repeatEvents[1].date).toBe('2025-03-28');
        expect(repeatEvents[2].date).toBe('2025-04-25');
      });

      it('매월 31일 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: exact)', () => {
        const eventData: Event = {
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
        const eventData: Event = {
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
        const eventData: Event = {
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

  describe('반복 간격 테스트', () => {
    it('2일 간격으로 반복', () => {
      const event = createEventData({
        repeat: {
          type: 'daily',
          interval: 2,
          endDate: '2025-02-07',
        },
      });

      const repeatEvents = generateRepeatEvents(
        event,
        event.repeat.type,
        event.repeat.interval,
        event.repeat.endDate!
      );

      verifyDates(repeatEvents, ['2025-02-01', '2025-02-03', '2025-02-05', '2025-02-07']);
    });

    describe('WEEKLY 테스트', () => {
      it('3주 간격으로 반복 일정을 생성할 수 있다.', () => {
        const eventData: Event = {
          id: '987654321',
          title: '3주간 정기 미팅',
          date: '2025-02-03',
          startTime: '14:00',
          endTime: '15:00',
          description: '3주마다 진행되는 정기 미팅',
          location: '회의실 C',
          category: '업무',
          repeat: {
            type: 'weekly',
            interval: 3,
            endDate: '2025-04-01',
          },
          notificationTime: 15,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!
        );

        expect(repeatEvents).toHaveLength(3);
        expect(repeatEvents[0].date).toBe('2025-02-03');
        expect(repeatEvents[1].date).toBe('2025-02-24');
        expect(repeatEvents[2].date).toBe('2025-03-17');
      });
    });

    describe('MONTHLY 테스트', () => {
      it('2개월 간격으로 31일 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: exact)', () => {
        const eventData: Event = {
          id: '123456789',
          title: '격월 31일 회의',
          date: '2024-10-31',
          startTime: '15:00',
          endTime: '16:00',
          description: '2개월마다 31일에 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 2,
            endDate: '2025-03-01',
          },
          notificationTime: 30,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'exact'
        );

        expect(repeatEvents).toHaveLength(3);
        expect(repeatEvents[0].date).toBe('2024-10-31');
        expect(repeatEvents[1].date).toBe('2024-12-31');
        expect(repeatEvents[2].date).toBe('2025-01-31');
      });

      it('2개월 간격으로 마지막 목요일 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: lastWeekday)', () => {
        const eventData: Event = {
          id: '123456789',
          title: '격월 마지막 주 목요일 회의',
          date: '2024-10-31',
          startTime: '15:00',
          endTime: '16:00',
          description: '2개월마다 마지막 주 목요일에 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 2,
            endDate: '2025-03-01',
          },
          notificationTime: 30,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'lastWeekday'
        );

        expect(repeatEvents).toHaveLength(3);
        expect(repeatEvents[0].date).toBe('2024-10-31');
        expect(repeatEvents[1].date).toBe('2024-12-26');
        expect(repeatEvents[2].date).toBe('2025-02-27');
      });

      it('2개월 간격으로 5번째 월요일 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: nthWeekday)', () => {
        const eventData: Event = {
          id: '123456789',
          title: '격월 5번째 월요일 회의',
          date: '2024-12-30',
          startTime: '15:00',
          endTime: '16:00',
          description: '2개월마다 5번째 월요일에 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 2,
            endDate: '2025-03-01',
          },
          notificationTime: 30,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'nthWeekday'
        );

        expect(repeatEvents).toHaveLength(1);
        expect(repeatEvents[0].date).toBe('2024-12-30');
      });

      it('2개월 간격으로 마지막 날 반복 일정을 생성할 수 있다. (REPEAT_PATTERN: lastDay)', () => {
        const eventData: Event = {
          id: '123456789',
          title: '월말 결산',
          date: '2024-10-31',
          startTime: '15:00',
          endTime: '16:00',
          description: '2개월마다 진행되는 결산 회의',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'monthly',
            interval: 2,
            endDate: '2025-01-31',
          },
          notificationTime: 30,
        };

        const repeatEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'lastDay'
        );

        expect(repeatEvents).toHaveLength(2);
        expect(repeatEvents[0].date).toBe('2024-10-31');
        expect(repeatEvents[1].date).toBe('2024-12-31');
      });
    });

    describe('YEARLY 테스트', () => {
      it('3년 간격으로 2월 28일에 반복되는 일정을 생성할 수 있다. (REPEAT_PATTERN: exact)', () => {
        const eventData: Event = {
          id: '312321321312321',
          title: '2월 말일 기념일',
          date: '2024-02-28',
          startTime: '12:00',
          endTime: '13:00',
          description: '2월 말일 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'yearly',
            interval: 3,
            endDate: '2033-02-28',
          },
          notificationTime: 10,
        };

        const exactEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'exact'
        );

        expect(exactEvents).toHaveLength(4);
        expect(exactEvents[0].date).toBe('2024-02-28');
        expect(exactEvents[1].date).toBe('2027-02-28');
        expect(exactEvents[2].date).toBe('2030-02-28');
        expect(exactEvents[3].date).toBe('2033-02-28');
      });

      it('3년 간격으로 2월 4번째 월요일에 반복되는 일정을 생성할 수 있다. (REPEAT_PATTERN: nthWeekday)', () => {
        const eventData: Event = {
          id: '312321321312321',
          title: '2월 4번째 월요일 기념일',
          date: '2024-02-26',
          startTime: '12:00',
          endTime: '13:00',
          description: '2월 4번째 월요일 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'yearly',
            interval: 3,
            endDate: '2033-02-28',
          },
          notificationTime: 10,
        };

        const nthWeekdayEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'nthWeekday'
        );

        expect(nthWeekdayEvents).toHaveLength(4);
        expect(nthWeekdayEvents[0].date).toBe('2024-02-26');
        expect(nthWeekdayEvents[1].date).toBe('2027-02-22');
        expect(nthWeekdayEvents[2].date).toBe('2030-02-25');
        expect(nthWeekdayEvents[3].date).toBe('2033-02-28');
      });

      it('3년 간격으로 매년 2월 마지막 금요일에 반복되는 일정을 생성할 수 있다. (REPEAT_PATTERN: lastWeekday)', () => {
        const eventData: Event = {
          id: '312321321312321',
          title: '2월 마지막 금요일 기념일',
          date: '2024-02-23',
          startTime: '12:00',
          endTime: '13:00',
          description: '2월 마지막 금요일 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'yearly',
            interval: 3,
            endDate: '2033-02-28',
          },
          notificationTime: 10,
        };

        const lastWeekdayEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'lastWeekday'
        );

        expect(lastWeekdayEvents).toHaveLength(4);
        expect(lastWeekdayEvents[0].date).toBe('2024-02-23');
        expect(lastWeekdayEvents[1].date).toBe('2027-02-26');
        expect(lastWeekdayEvents[2].date).toBe('2030-02-22');
        expect(lastWeekdayEvents[3].date).toBe('2033-02-25');
      });

      it('3년 간격으로 매년 2월 마지막 날에 반복되는 일정을 생성할 수 있다. (REPEAT_PATTERN: lastDay)', () => {
        const eventData: Event = {
          id: '312321321312321',
          title: '2월 마지막 날 기념일',
          date: '2024-02-28',
          startTime: '12:00',
          endTime: '13:00',
          description: '2월 마지막 날 기념일',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'yearly',
            interval: 3,
            endDate: '2033-02-28',
          },
          notificationTime: 10,
        };

        const lastDayEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'lastDay'
        );

        expect(lastDayEvents).toHaveLength(4);
        expect(lastDayEvents[0].date).toBe('2024-02-29');
        expect(lastDayEvents[1].date).toBe('2027-02-28');
        expect(lastDayEvents[2].date).toBe('2030-02-28');
        expect(lastDayEvents[3].date).toBe('2033-02-28');
      });

      it('3년 간격으로 윤년을 고려하여 2월 29일에 반복되는 일정을 생성할 수 있다. (REPEAT_PATTERN: exact)', () => {
        const eventData: Event = {
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
            interval: 3,
            endDate: '2033-02-29',
          },
          notificationTime: 10,
        };

        const exactEvents = generateRepeatEvents(
          eventData,
          eventData.repeat.type,
          eventData.repeat.interval,
          eventData.repeat.endDate!,
          'exact'
        );

        expect(exactEvents).toHaveLength(1);
        expect(exactEvents[0].date).toBe('2024-02-29');
      });
    });
  });
});
