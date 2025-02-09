import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('useCalendarView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 9, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('초기 상태', () => {
    it('view는 "month"이어야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      expect(result.current.view).toBe('month');
    });

    it('currentDate는 오늘 날짜인 "2024-10-01"이어야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      assertDate(result.current.currentDate, new Date(2024, 9, 1));
    });

    it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
      const { result } = renderHook(() => useCalendarView());
      expect(result.current.holidays).toEqual({
        '2024-10-03': '개천절',
        '2024-10-09': '한글날',
      });
    });
  });

  it("view를 'week'으로 변경하면 view 상태가 'week'로 업데이트된다", () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.setView('week');
    });
    expect(result.current.view).toBe('week');
  });

  describe('주간/월간 뷰 이동', () => {
    it("주간 뷰에서 다음으로 navigate시 7일 후 '2024-10-08' 날짜로 지정이 된다", () => {
      const { result } = renderHook(() => useCalendarView());
      act(() => {
        result.current.setView('week');
      });
      act(() => {
        result.current.navigate('next');
      });
      assertDate(result.current.currentDate, new Date(2024, 9, 8));
    });

    it("주간 뷰에서 이전으로 navigate시 7일 전 '2024-09-24' 날짜로 지정이 된다", () => {
      const { result } = renderHook(() => useCalendarView());
      act(() => {
        result.current.setView('week');
      });
      act(() => {
        result.current.navigate('prev');
      });
      assertDate(result.current.currentDate, new Date(2024, 8, 24));
    });

    it("월간 뷰에서 다음으로 navigate시 다음 달 '2024-11-01' 날짜여야 한다", () => {
      const { result } = renderHook(() => useCalendarView());
      act(() => {
        result.current.setView('month');
      });
      act(() => {
        result.current.navigate('next');
      });
      assertDate(result.current.currentDate, new Date(2024, 10, 1));
    });

    it("월간 뷰에서 이전으로 navigate시 이전 달 '2024-09-01' 날짜여야 한다", () => {
      const { result } = renderHook(() => useCalendarView());
      act(() => {
        result.current.setView('month');
      });
      act(() => {
        result.current.navigate('prev');
      });
      assertDate(result.current.currentDate, new Date(2024, 8, 1));
    });
  });

  describe('휴일 업데이트', () => {
    it("currentDate가 '2024-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
      const { result } = renderHook(() => useCalendarView());

      act(() => {
        result.current.setCurrentDate(new Date(2024, 0, 1));
      });
      expect(result.current.holidays).toEqual({
        '2024-01-01': '신정',
      });
    });
  });
});
