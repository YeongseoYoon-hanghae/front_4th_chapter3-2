import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('2024년 1월은 31일을 반환한다', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
  });

  it('2024년 4월은 30일을 반환한다', () => {
    expect(getDaysInMonth(2024, 4)).toBe(30);
  });

  it('2024년(윤년) 2월은 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('2023년(평년) 2월은 28일을 반환한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });

  it('잘못된 월(13)을 입력하면 이전 년도의 1월의 일수를 반환한다', () => {
    expect(getDaysInMonth(2024, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('2024년 7월 3일(수요일)이 속한 주의 모든 날짜를 반환한다', () => {
    const date = new Date('2024-07-03T09:00:00.000Z');
    const weekDates = getWeekDates(date);

    const formattedDates = weekDates.map((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    expect(formattedDates).toEqual([
      '2024-06-30',
      '2024-07-01',
      '2024-07-02',
      '2024-07-03',
      '2024-07-04',
      '2024-07-05',
      '2024-07-06',
    ]);
  });

  it('2024년 12월 29일(일요일)이 속한 주의 모든 날짜를 반환한다', () => {
    const date = new Date('2024-12-29T09:00:00.000Z');
    const weekDates = getWeekDates(date);

    const formattedDates = weekDates.map((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    expect(formattedDates).toEqual([
      '2024-12-29',
      '2024-12-30',
      '2024-12-31',
      '2025-01-01',
      '2025-01-02',
      '2025-01-03',
      '2025-01-04',
    ]);
  });

  it('2024년 1월 1일(월요일)이 속한 주의 모든 날짜를 반환한다', () => {
    const date = new Date('2024-01-01T09:00:00.000Z');
    const weekDates = getWeekDates(date);

    const formattedDates = weekDates.map((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    expect(formattedDates).toEqual([
      '2023-12-31',
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
      '2024-01-04',
      '2024-01-05',
      '2024-01-06',
    ]);
  });

  it('2024년 2월 29일(윤년)이 속한 주의 모든 날짜를 반환한다', () => {
    const date = new Date('2024-02-29T09:00:00.000Z');
    const weekDates = getWeekDates(date);

    const formattedDates = weekDates.map((date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    expect(formattedDates).toEqual([
      '2024-02-25',
      '2024-02-26',
      '2024-02-27',
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
      '2024-03-02',
    ]);
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월(일반적인 달)의 주 정보를 반환한다', () => {
    const date = new Date('2024-07-01');
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toEqual([
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, 31, null, null, null],
    ]);
  });

  it('2024년 2월(윤년)의 주 정보를 반환한다', () => {
    const date = new Date('2024-02-01');
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toEqual([
      [null, null, null, null, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15, 16, 17],
      [18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, null, null],
    ]);
  });

  it('2025년 3월(6주가 되는 달)의 주 정보를 반환한다', () => {
    const date = new Date('2025-03-01');
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toEqual([
      [null, null, null, null, null, null, 1],
      [2, 3, 4, 5, 6, 7, 8],
      [9, 10, 11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20, 21, 22],
      [23, 24, 25, 26, 27, 28, 29],
      [30, 31, null, null, null, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  const sampleEvents: Event[] = [
    {
      id: '1',
      title: '7월 1일 이벤트',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 설명',
      location: '장소 1',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '7월 15일 이벤트',
      date: '2024-07-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 설명',
      location: '장소 2',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '3',
      title: '7월 15일 다른 이벤트',
      date: '2024-07-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '이벤트 설명',
      location: '장소 3',
      category: '미팅',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
    {
      id: '4',
      title: '8월 1일 이벤트',
      date: '2024-08-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 설명',
      location: '장소 4',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('하나의 날짜(1일)를 포함하는 이벤트들이 있는 경우, 해당 날짜의 모든 이벤트를 반환한다', () => {
    const events = getEventsForDay(sampleEvents, 1);

    expect(events).toEqual([sampleEvents[0], sampleEvents[3]]);
  });

  it('동일한 날짜(15일)에 여러 이벤트가 있는 경우, 해당 날짜의 모든 이벤트를 반환한다', () => {
    const events = getEventsForDay(sampleEvents, 15);

    expect(events).toEqual([sampleEvents[1], sampleEvents[2]]);
  });

  it('이벤트가 없는 날짜(2일)인 경우, 빈 배열을 반환한다', () => {
    const events = getEventsForDay(sampleEvents, 2);

    expect(events).toEqual([]);
  });

  it('유효하지 않은 날짜(0일)인 경우, 빈 배열을 반환한다', () => {
    const events = getEventsForDay(sampleEvents, 0);

    expect(events).toEqual([]);
  });

  it('유효하지 않은 날짜(32일)인 경우, 빈 배열을 반환한다', () => {
    const events = getEventsForDay(sampleEvents, 32);

    expect(events).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('2024년 7월 15일(월)이 포함된 주는 "2024년 7월 3주"를 반환한다', () => {
    const result = formatWeek(new Date('2024-07-15'));

    expect(result).toBe('2024년 7월 3주');
  });

  it('2024년 7월 1일(월)이 포함된 주는 "2024년 7월 1주"를 반환한다', () => {
    const result = formatWeek(new Date('2024-07-01'));

    expect(result).toBe('2024년 7월 1주');
  });

  it('2024년 7월 31일(수)이 포함된 주는 "2024년 8월 1주"를 반환한다', () => {
    const result = formatWeek(new Date('2024-07-31'));

    expect(result).toBe('2024년 8월 1주');
  });

  it('2024년 12월 30일(월)이 포함된 주는 "2025년 1월 1주"를 반환한다', () => {
    const result = formatWeek(new Date('2024-12-30'));

    expect(result).toBe('2025년 1월 1주');
  });

  it('2024년 2월 29일(목, 윤년)이 포함된 주는 "2024년 2월 5주"를 반환한다', () => {
    const result = formatWeek(new Date('2024-02-29'));

    expect(result).toBe('2024년 2월 5주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const date = new Date('2024-07-10');

    const result = formatMonth(date);

    expect(result).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위의 시작일 2024-07-01이 주어지면 true를 반환한다', () => {
    const date = new Date('2024-07-01');

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(true);
  });

  it('종료일 2024-07-31이 주어지면 true를 반환한다', () => {
    const date = new Date('2024-07-31');

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(true);
  });

  it('범위 이전 날짜 2024-06-30이 주어지면 false를 반환한다', () => {
    const date = new Date('2024-06-30');

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(false);
  });

  it('범위 이후 날짜 2024-08-01이 주어지면 false를 반환한다', () => {
    const date = new Date('2024-08-01');

    const result = isDateInRange(date, rangeStart, rangeEnd);

    expect(result).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const invalidRangeStart = new Date('2024-07-31');
    const invalidRangeEnd = new Date('2024-07-01');
    const date = new Date('2024-07-15');

    const result = isDateInRange(date, invalidRangeStart, invalidRangeEnd);

    expect(result).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    const result = fillZero(5);

    expect(result).toBe('05');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    const result = fillZero(100);

    expect(result).toBe('100');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    const result = fillZero(1, 5);

    expect(result).toBe('00001');
  });

  it('소수점이 있는 3.14를 5자리로 변환하면 "03.14"를 반환한다', () => {
    const result = fillZero(3.14, 5);

    expect(result).toBe('03.14');
  });
});

describe('formatDate', () => {
  it('Date 객체의 3월 5일을 "2024-03-05" 형식으로 반환한다', () => {
    const date = new Date('2024-03-05');

    const result = formatDate(date);

    expect(result).toBe('2024-03-05');
  });

  it('2024년 7월 1일에 day로 15를 전달하면 "2024-07-15"를 반환한다', () => {
    const date = new Date('2024-07-01');

    const result = formatDate(date, 15);

    expect(result).toBe('2024-07-15');
  });
});
