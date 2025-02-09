import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');
    expect(result).toEqual(new Date('2024-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024-13-01', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024-07-01', '25:00');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const validEvent: Event = {
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
  };

  it('이벤트를 시작/종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(validEvent);
    expect(result).toEqual({
      start: new Date('2024-10-01T09:00'),
      end: new Date('2024-10-01T10:00'),
    });
  });

  // NOTE: parseDateTime에서 진행하는 중복 테스트라 주석처리함 -> ci에서 오류나서 복구
  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...validEvent, date: '2024-13-01' };
    const result = convertEventToDateRange(invalidEvent);
    expect(result.start.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidEvent = { ...validEvent, startTime: '25:00' };
    const result = convertEventToDateRange(invalidEvent);
    expect(result.start.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const event1: Event = {
    id: '1',
    date: '2024-07-01',
    startTime: '14:00',
    endTime: '15:00',
    title: 'Meeting 1',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event2: Event = {
      ...event1,
      id: '2',
      startTime: '14:30',
      endTime: '15:30',
      title: 'Meeting 2',
    };

    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event2: Event = {
      ...event1,
      id: '2',
      startTime: '15:30',
      endTime: '16:30',
      title: 'Meeting 2',
    };
    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

// NOTE: 하위에 isOverlapping이 있어 테스트가 중복되는 느낌...이긴한데 필터링을 하는거라 테스트를 해야하나?
describe('findOverlappingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    date: '2024-07-01',
    startTime: '14:00',
    endTime: '15:00',
    title: 'Meeting 1',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const sameTimeEvent: Event = {
      ...baseEvent,
      id: '2',
      title: 'Meeting 2',
    };

    const events = [baseEvent, sameTimeEvent];
    const result = findOverlappingEvents(baseEvent, events);
    expect(result).toEqual([sameTimeEvent]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const nonOverlappingEvent: Event = {
      ...baseEvent,
      id: '2',
      startTime: '16:00',
      endTime: '17:00',
      title: 'Meeting 2',
    };
    const result = findOverlappingEvents(baseEvent, [nonOverlappingEvent]);
    expect(result).toEqual([]);
  });
});
