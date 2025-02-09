import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    const date = new Date('2024-02-15');
    const result = fetchHolidays(date);

    expect(result).toEqual({
      '2024-02-09': '설날',
      '2024-02-10': '설날',
      '2024-02-11': '설날',
    });
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const date = new Date('2024-04-15');
    const result = fetchHolidays(date);

    expect(result).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const date = new Date('2024-09-15');
    const result = fetchHolidays(date);

    expect(result).toEqual({
      '2024-09-16': '추석',
      '2024-09-17': '추석',
      '2024-09-18': '추석',
    });
  });

  it('연도가 다른 같은 월의 공휴일은 포함하지 않는다', () => {
    const date = new Date('2023-01-15');
    const result = fetchHolidays(date);

    expect(result).toEqual({});
  });
});
