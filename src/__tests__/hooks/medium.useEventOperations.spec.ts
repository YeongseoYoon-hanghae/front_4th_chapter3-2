import { useToast } from '@chakra-ui/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { server } from '../../__mocks__/server.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event } from '../../types.ts';

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

describe('useEventOperations', () => {
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

  beforeEach(() => {
    mockToast.mockClear();
  });

  it('초기 이벤트 목록을 불러온다', async () => {
    const initialEvent = createEvent();
    setupMockHandlerCreation([initialEvent]);

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual([initialEvent]);
    });
  });

  it('새로운 이벤트가 정상적으로 저장된다', async () => {
    setupMockHandlerCreation([]);
    const newEvent = createEvent({
      id: undefined,
      title: '신규 회의',
      date: '2024-07-20',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 미팅',
      location: '회의실 A',
      category: '프로젝트',
      notificationTime: 15,
    });
    const mockSave = vi.fn();

    const { result } = renderHook(() => useEventOperations(false, mockSave));
    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(result.current.events[0]).toEqual(
        expect.objectContaining({
          title: '신규 회의',
          date: '2024-07-20',
          startTime: '14:00',
          endTime: '15:00',
          description: '프로젝트 미팅',
          location: '회의실 A',
          category: '프로젝트',
          notificationTime: 15,
        })
      );
      expect(result.current.events[0].id).toBeDefined();
      expect(mockSave).toHaveBeenCalled();
    });
  });

  it('이벤트가 정상적으로 업데이트 된다', async () => {
    const event = createEvent();
    setupMockHandlerUpdating([event]);

    const { result } = renderHook(() => useEventOperations(true));
    await act(async () => {
      await result.current.saveEvent({
        ...event,
        title: '수정된 회의',
        endTime: '11:00',
      });
    });

    await waitFor(() => {
      expect(result.current.events[0].title).toBe('수정된 회의');
      expect(result.current.events[0].endTime).toBe('11:00');
    });
  });

  it('이벤트가 정상적으로 삭제된다.', async () => {
    const event = createEvent();
    setupMockHandlerDeletion([event]);

    const { result } = renderHook(() => useEventOperations(false));
    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(0);
    });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(http.get('/api/events', () => new HttpResponse(null, { status: 500 })));
    const mockToast = vi.mocked(useToast)();

    renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const event = createEvent();
    setupMockHandlerUpdating([]);
    server.use(http.put('/api/events/:id', () => new HttpResponse(null, { status: 404 })));
    const mockToast = vi.mocked(useToast)();

    const { result } = renderHook(() => useEventOperations(true));
    await act(async () => {
      await result.current.saveEvent(event);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 })));
    const mockToast = vi.mocked(useToast)();
    const event = createEvent();
    setupMockHandlerCreation([event]);

    const { result } = renderHook(() => useEventOperations(false));
    await act(async () => {
      await result.current.deleteEvent(event.id);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      expect(result.current.events).toContainEqual(event);
    });
  });
});
