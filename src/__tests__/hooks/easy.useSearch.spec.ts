import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';

describe('useSearch', () => {
  const createEvent = (overrides = {}): Event => ({
    id: '1',
    title: '기본 회의',
    date: '2024-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    ...overrides,
  });

  beforeEach(() => {
    vi.setSystemTime(new Date(2024, 9, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('초기 상태', () => {
    it('searchTerm은 빈 문자열로 초기화된다', () => {
      const { result } = renderHook(() => useSearch([], new Date(), 'month'));
      expect(result.current.searchTerm).toBe('');
    });

    it('초기 상태에서 현재 월의 모든 이벤트를 반환한다', () => {
      const events = [
        createEvent({ date: '2024-10-01' }),
        createEvent({ date: '2024-10-15', id: '2' }),
      ];

      const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

      expect(result.current.filteredEvents).toHaveLength(2);
      expect(result.current.filteredEvents.map((e) => e.date).sort()).toEqual([
        '2024-10-01',
        '2024-10-15',
      ]);
    });
  });

  describe('검색어 필터링', () => {
    it('"새새로운" 키워드를 검색 시 "새새로운 회의"가 결과로 즉시 업데이트된다', () => {
      const events = [
        createEvent({ title: '새새로운 회의' }),
        createEvent({ title: '일반 회의', id: '2' }),
      ];

      const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

      act(() => {
        result.current.setSearchTerm('새새로운');
      });

      expect(result.current.searchTerm).toBe('새새로운');
      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].title).toBe('새새로운 회의');
    });

    it('필터링 시 제목, 설명, 위치를 모두 검색한다', () => {
      const events = [
        createEvent({
          title: '회의',
          description: '팀 미팅',
          location: '회의실',
        }),
      ];

      const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

      act(() => {
        result.current.setSearchTerm('팀 미팅');
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0]).toEqual(
        expect.objectContaining({
          description: '팀 미팅',
          date: '2024-10-01',
        })
      );
    });
  });

  describe('날짜 필터링', () => {
    it('week 뷰에서는 현재 날짜가 속한 주의 이벤트만 반환한다', () => {
      const events = [
        createEvent({ date: '2024-10-01' }),
        createEvent({ date: '2024-10-08', id: '2' }),
      ];

      const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

      result.current.filteredEvents.forEach((event) => {
        const eventDate = new Date(event.date);
        const weekStart = new Date(2024, 9, 1);
        const weekEnd = new Date(2024, 9, 7);
        expect(eventDate >= weekStart && eventDate <= weekEnd).toBe(true);
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].date).toBe('2024-10-01');
    });

    it('month 뷰에서는 2024년 10월의 이벤트만 반환한다', () => {
      const events = [
        createEvent({ date: '2024-10-01' }),
        createEvent({ date: '2024-10-15', id: '2' }),
        createEvent({ date: '2024-09-30', id: '3' }),
      ];

      const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

      result.current.filteredEvents.forEach((event) => {
        const eventDate = new Date(event.date);
        expect(eventDate.getMonth()).toBe(9);
        expect(eventDate.getFullYear()).toBe(2024);
      });

      expect(result.current.filteredEvents).toHaveLength(2);
      expect(result.current.filteredEvents.map((e) => e.date).sort()).toEqual([
        '2024-10-01',
        '2024-10-15',
      ]);
    });
  });

  describe('복합 필터링', () => {
    it('현재 날짜가 속한 주의 이벤트 중 "회의"가 포함된 이벤트만 반환한다', () => {
      const events = [
        createEvent({ date: '2024-10-01', title: '기존 회의' }),
        createEvent({ date: '2024-10-08', title: '다른 회의', id: '2' }), // 다음 주
      ];

      const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

      act(() => {
        result.current.setSearchTerm('회의');
      });

      result.current.filteredEvents.forEach((event) => {
        expect(
          event.title.includes('회의') ||
            event.description.includes('회의') ||
            event.location.includes('회의')
        ).toBe(true);

        const eventDate = new Date(event.date);
        const weekStart = new Date(2024, 9, 1);
        const weekEnd = new Date(2024, 9, 7);
        expect(eventDate >= weekStart && eventDate <= weekEnd).toBe(true);
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0]).toEqual(
        expect.objectContaining({
          date: '2024-10-01',
          title: '기존 회의',
        })
      );
    });
  });
});
