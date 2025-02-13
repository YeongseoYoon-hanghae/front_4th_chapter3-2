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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
        });

        expect(repeatEvents).toHaveLength(5);
        expect(repeatEvents[0].date).toBe('2025-02-01');
        expect(repeatEvents[1].date).toBe('2025-02-02');
        expect(repeatEvents[2].date).toBe('2025-02-03');
        expect(repeatEvents[3].date).toBe('2025-02-04');
        expect(repeatEvents[4].date).toBe('2025-02-05');
      });
      it('윤년(2월 29일) 반복 일정 생성', () => {
        const event = createEventData({
          date: '2024-02-29',
          repeat: {
            type: 'yearly',
            interval: 1,
            endDate: '2032-02-29',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          endDate: event.repeat.endDate!,
          repeatPattern: 'exact',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'exact',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'nthWeekday',
        });

        expect(repeatEvents).toHaveLength(2);
        expect(repeatEvents[0].date).toBe('2025-01-30');
        expect(repeatEvents[1].date).toBe('2026-01-29');
      });
    });

    describe('MONTHLY 테스트', () => {
      it('매월 마지막 날 반복', () => {
        const event = createEventData({
          date: '2025-10-31',
          repeat: {
            type: 'monthly',
            interval: 1,
            endDate: '2025-12-31',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          endDate: event.repeat.endDate!,
          repeatPattern: 'lastDay',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'nthWeekday',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'lastWeekday',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'lastWeekday',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'exact',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
        });

        expect(repeatEvents).toHaveLength(5);
        expect(repeatEvents[0].date).toBe('2025-02-03');
        expect(repeatEvents[1].date).toBe('2025-02-10');
        expect(repeatEvents[2].date).toBe('2025-02-17');
        expect(repeatEvents[3].date).toBe('2025-02-24');
        expect(repeatEvents[4].date).toBe('2025-03-03');
      });
    });
  });

  describe('반복 간격 테스트', () => {
    describe('DAILY 테스트', () => {
      it('2일 간격으로 반복', () => {
        const event = createEventData({
          repeat: {
            type: 'daily',
            interval: 2,
            endDate: '2025-02-07',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          endDate: event.repeat.endDate!,
        });

        verifyDates(repeatEvents, ['2025-02-01', '2025-02-03', '2025-02-05', '2025-02-07']);
      });
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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'exact',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'lastWeekday',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'nthWeekday',
        });

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

        const repeatEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'lastDay',
        });

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

        const exactEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'exact',
        });

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

        const nthWeekdayEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'nthWeekday',
        });

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

        const lastWeekdayEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'lastWeekday',
        });

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

        const lastDayEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'lastDay',
        });

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

        const exactEvents = generateRepeatEvents({
          baseEvent: eventData,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate!,
          repeatPattern: 'exact',
        });

        expect(exactEvents).toHaveLength(1);
        expect(exactEvents[0].date).toBe('2024-02-29');
      });
    });
  });

  describe('반복 종료 테스트 (2025년 06월 30일까지)', () => {
    describe('반복종료 타입이 endCount인 경우', () => {
      it('매일 반복되는 일정을 10회 생성할 수 있다.', () => {
        const event = createEventData({
          date: '2024-02-29',
          repeat: {
            type: 'daily',
            interval: 1,
            repeatEnd: 'endCount',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          repeatPattern: 'exact',
          endCount: 10,
          endDate: '2025-06-30',
        });

        expect(repeatEvents).toHaveLength(10);

        expect(repeatEvents[0].date).toBe('2024-02-29');
        expect(repeatEvents[1].date).toBe('2024-03-01');
        expect(repeatEvents[2].date).toBe('2024-03-02');
        expect(repeatEvents[3].date).toBe('2024-03-03');
        expect(repeatEvents[4].date).toBe('2024-03-04');
        expect(repeatEvents[5].date).toBe('2024-03-05');
        expect(repeatEvents[6].date).toBe('2024-03-06');
        expect(repeatEvents[7].date).toBe('2024-03-07');
        expect(repeatEvents[8].date).toBe('2024-03-08');
        expect(repeatEvents[9].date).toBe('2024-03-09');
      });

      it('매주 반복되는 일정을 10회 생성할 수 있다.', () => {
        const event = createEventData({
          date: '2024-02-29',
          repeat: {
            type: 'weekly',
            interval: 1,
            repeatEnd: 'endCount',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          endCount: 10,
          repeatPattern: 'exact',
          endDate: '2025-06-30',
        });

        expect(repeatEvents).toHaveLength(10);

        expect(repeatEvents[0].date).toBe('2024-02-29');
        expect(repeatEvents[1].date).toBe('2024-03-07');
        expect(repeatEvents[2].date).toBe('2024-03-14');
        expect(repeatEvents[3].date).toBe('2024-03-21');
        expect(repeatEvents[4].date).toBe('2024-03-28');
        expect(repeatEvents[5].date).toBe('2024-04-04');
        expect(repeatEvents[6].date).toBe('2024-04-11');
        expect(repeatEvents[7].date).toBe('2024-04-18');
        expect(repeatEvents[8].date).toBe('2024-04-25');
        expect(repeatEvents[9].date).toBe('2024-05-02');
      });

      it('매월 반복되는 일정을 10회 생성할 수 있다.', () => {
        const event = createEventData({
          date: '2024-02-29',
          repeat: {
            type: 'monthly',
            interval: 1,
            repeatEnd: 'endCount',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          endCount: 10,
          repeatPattern: 'exact',
          endDate: '2025-06-30',
        });

        expect(repeatEvents).toHaveLength(10);

        expect(repeatEvents[0].date).toBe('2024-02-29');
        expect(repeatEvents[1].date).toBe('2024-03-29');
        expect(repeatEvents[2].date).toBe('2024-04-29');
        expect(repeatEvents[3].date).toBe('2024-05-29');
        expect(repeatEvents[4].date).toBe('2024-06-29');
        expect(repeatEvents[5].date).toBe('2024-07-29');
        expect(repeatEvents[6].date).toBe('2024-08-29');
        expect(repeatEvents[7].date).toBe('2024-09-29');
        expect(repeatEvents[8].date).toBe('2024-10-29');
        expect(repeatEvents[9].date).toBe('2024-11-29');
      });

      it('매년 반복되는 일정을 10회 생성할 수 있다.', () => {
        const event = createEventData({
          date: '2016-02-01',
          repeat: {
            type: 'yearly',
            interval: 1,
            repeatEnd: 'endCount',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          endCount: 10,
          repeatPattern: 'exact',
          endDate: '2025-06-30',
        });

        expect(repeatEvents).toHaveLength(10);

        expect(repeatEvents[0].date).toBe('2016-02-01');
        expect(repeatEvents[1].date).toBe('2017-02-01');
        expect(repeatEvents[2].date).toBe('2018-02-01');
        expect(repeatEvents[3].date).toBe('2019-02-01');
        expect(repeatEvents[4].date).toBe('2020-02-01');
        expect(repeatEvents[5].date).toBe('2021-02-01');
        expect(repeatEvents[6].date).toBe('2022-02-01');
        expect(repeatEvents[7].date).toBe('2023-02-01');
        expect(repeatEvents[8].date).toBe('2024-02-01');
        expect(repeatEvents[9].date).toBe('2025-02-01');
      });

      it('매월 31일 반복 시 30일까지 있는 달은 건너뛰어 생성할 수 있다.', () => {
        const event = createEventData({
          date: '2024-01-31',
          repeat: {
            type: 'monthly',
            interval: 1,
            repeatEnd: 'endCount',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          endCount: 5,
          repeatPattern: 'exact',
          endDate: '2024-08-31',
        });

        expect(repeatEvents).toHaveLength(5);
        expect(repeatEvents[0].date).toBe('2024-01-31');
        expect(repeatEvents[1].date).toBe('2024-03-31');
        expect(repeatEvents[2].date).toBe('2024-05-31');
        expect(repeatEvents[3].date).toBe('2024-07-31');
        expect(repeatEvents[4].date).toBe('2024-08-31');
      });

      it('윤년에서 시작하여 매년 2월 29일 반복 시 윤년만 10회 생성할 수 있다.', () => {
        const event = createEventData({
          date: '1980-02-29',
          repeat: {
            type: 'yearly',
            interval: 1,
            repeatEnd: 'endCount',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          endCount: 10,
          repeatPattern: 'exact',
          endDate: '2025-06-30',
        });

        expect(repeatEvents).toHaveLength(10);

        expect(repeatEvents[0].date).toBe('1980-02-29');
        expect(repeatEvents[1].date).toBe('1984-02-29');
        expect(repeatEvents[2].date).toBe('1988-02-29');
        expect(repeatEvents[3].date).toBe('1992-02-29');
        expect(repeatEvents[4].date).toBe('1996-02-29');
        expect(repeatEvents[5].date).toBe('2000-02-29');
        expect(repeatEvents[6].date).toBe('2004-02-29');
        expect(repeatEvents[7].date).toBe('2008-02-29');
        expect(repeatEvents[8].date).toBe('2012-02-29');
        expect(repeatEvents[9].date).toBe('2016-02-29');
      });

      it('31일이 있는 날짜에서 시작하여 매월 31일이 있는 달만 정확히 5회 생성할 수 있다.', () => {
        const event = createEventData({
          date: '2024-01-31',
          repeat: {
            type: 'monthly',
            interval: 1,
            repeatEnd: 'endCount',
          },
        });

        const repeatEvents = generateRepeatEvents({
          baseEvent: event,
          repeatType: event.repeat.type,
          interval: event.repeat.interval,
          endCount: 5,
          repeatPattern: 'exact',
          endDate: '2024-12-31',
        });

        expect(repeatEvents).toHaveLength(5);
        verifyDates(repeatEvents, [
          '2024-01-31',
          '2024-03-31',
          '2024-05-31',
          '2024-07-31',
          '2024-08-31',
        ]);
      });
    });
  });
});
