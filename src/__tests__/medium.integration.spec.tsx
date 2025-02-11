import { screen, within, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { renderWithSetup } from './test-utils';

beforeAll(() => {
  vi.setSystemTime(new Date('2024-10-17T09:00:00.000Z'));
});

afterAll(() => {
  vi.useRealTimers();
});

describe('일정 CRUD 및 기본 기능', () => {
  const sampleEvent = {
    id: '1',
    title: '팀 회의',
    date: '2024-10-17',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none' as const,
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  };
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();
    const { user } = renderWithSetup(<App />);

    await user.type(screen.getByLabelText(/제목/), sampleEvent.title);
    await user.type(screen.getByLabelText(/날짜/), sampleEvent.date);
    await user.type(screen.getByLabelText(/시작 시간/), sampleEvent.startTime);
    await user.type(screen.getByLabelText(/종료 시간/), sampleEvent.endTime);
    await user.type(screen.getByLabelText(/설명/), sampleEvent.description);
    await user.type(screen.getByLabelText(/위치/), sampleEvent.location);
    await user.selectOptions(screen.getByLabelText(/카테고리/), sampleEvent.category);

    const addButton = await screen.findByRole('button', { name: /일정 추가/ });
    await user.click(addButton);

    const eventList = await screen.findByTestId('event-list');

    expect(await within(eventList).findByText(sampleEvent.title)).toBeInTheDocument();
    expect(await within(eventList).findByText(sampleEvent.date)).toBeInTheDocument();
    expect(await within(eventList).findByText(sampleEvent.description)).toBeInTheDocument();
    expect(await within(eventList).findByText(sampleEvent.location)).toBeInTheDocument();
    expect(
      await within(eventList).findByText(`${sampleEvent.startTime} - ${sampleEvent.endTime}`)
    ).toBeInTheDocument();
    expect(
      await within(eventList).findByText(`카테고리: ${sampleEvent.category}`)
    ).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const initialEvent = { ...sampleEvent };
    setupMockHandlerUpdating([initialEvent]);
    const { user } = renderWithSetup(<App />);

    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    await user.clear(screen.getByLabelText(/제목/));
    await user.type(screen.getByLabelText(/제목/), '수정된 팀 회의');
    await user.clear(screen.getByLabelText(/설명/));
    await user.type(screen.getByLabelText(/설명/), '수정된 설명');
    await user.clear(screen.getByLabelText(/위치/));
    await user.type(screen.getByLabelText(/위치/), '수정된 위치');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '개인');
    await user.selectOptions(screen.getByLabelText(/알림 설정/), '60');

    const eventList = await screen.findByTestId('event-list');

    const saveButton = await screen.findByRole('button', { name: /일정 수정/ });
    await user.click(saveButton);

    expect(await within(eventList).findByText('수정된 팀 회의')).toBeInTheDocument();
    expect(await within(eventList).findByText('수정된 설명')).toBeInTheDocument();
    expect(await within(eventList).findByText('수정된 위치')).toBeInTheDocument();
    expect(await within(eventList).findByText('카테고리: 개인')).toBeInTheDocument();
    expect(await within(eventList).findByText(/알림: 1시간 전/)).toBeInTheDocument();
  });

  it('일정 삭제 후 목록에서 제거되고 "검색 결과가 없습니다" 메시지가 표시된다.', async () => {
    const initialEvent = { ...sampleEvent };
    setupMockHandlerDeletion([initialEvent]);
    const { user } = renderWithSetup(<App />);

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText(sampleEvent.title)).toBeInTheDocument();

    const deleteButton = await within(eventList).findByRole('button', { name: 'Delete event' });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(within(eventList).queryByText(sampleEvent.title)).not.toBeInTheDocument();
    });
    expect(await within(eventList).findByText(/검색 결과가 없습니다/)).toBeInTheDocument();
  });
});

describe('일정 뷰 테스트', () => {
  describe('주별 뷰 테스트', () => {
    const sampleEvent = {
      id: '1',
      title: '팀 회의',
      date: '2024-10-17',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 1,
        endDate: undefined,
      },
      notificationTime: 10,
    };

    it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
      setupMockHandlerCreation();
      const { user } = renderWithSetup(<App />);

      await user.selectOptions(screen.getByLabelText('view'), 'week');

      const weekView = await screen.findByTestId('week-view');
      expect(weekView).toBeInTheDocument();
      await waitFor(() => {
        const eventBox = within(weekView).queryByLabelText('event-box');
        expect(eventBox).not.toBeInTheDocument();
      });
      expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
    });

    it('주별 뷰 선택 후 해당 일자에 일정이 존재하다면 해당 일정이 정확히 표시된다', async () => {
      const { events } = setupMockHandlerUpdating([sampleEvent]);
      const { user } = renderWithSetup(<App />);

      await user.selectOptions(screen.getByLabelText('view'), 'week');

      const weekView = await screen.findByTestId('week-view');
      expect(weekView).toBeInTheDocument();

      expect(await within(weekView).findByText('목')).toBeInTheDocument();
      expect(await within(weekView).findByText(events[0].title)).toBeInTheDocument();

      const eventList = await screen.findByTestId('event-list');
      expect(await within(eventList).findByText(events[0].title)).toBeInTheDocument();
      expect(
        await within(eventList).findByText(`${events[0].startTime} - ${events[0].endTime}`)
      ).toBeInTheDocument();
    });
  });

  describe('월별 뷰 테스트', () => {
    const sampleEvent = {
      id: '1',
      title: '팀 회의',
      date: '2024-10-17',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'none' as const,
        interval: 1,
        endDate: undefined,
      },
      notificationTime: 10,
    };

    it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
      setupMockHandlerCreation();
      const { user } = renderWithSetup(<App />);

      await user.selectOptions(screen.getByLabelText('view'), 'month');

      const monthView = screen.getByTestId('month-view');
      expect(monthView).toBeInTheDocument();
      await waitFor(() => {
        const eventBox = within(monthView).queryByLabelText('event-box');
        expect(eventBox).not.toBeInTheDocument();
      });
      expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
    });

    it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
      const events = [
        {
          ...sampleEvent,
          date: '2024-10-01',
          title: '월초 회의',
        },
        {
          ...sampleEvent,
          id: '2',
          date: '2024-10-31',
          title: '월말 회의',
        },
      ];
      setupMockHandlerCreation(events);
      const { user } = renderWithSetup(<App />);
      await user.selectOptions(screen.getByLabelText('view'), 'month');

      const monthView = await screen.findByTestId('month-view');
      expect(monthView).toBeInTheDocument();

      const eventList = await screen.findByTestId('event-list');

      expect(await within(eventList).findByText('월초 회의')).toBeInTheDocument();
      expect(await within(eventList).findByText('월말 회의')).toBeInTheDocument();
    });
  });

  describe('공휴일 테스트', () => {
    it('달력에 10월 3일 개천절이 공휴일로 표시되는지 확인한다', async () => {
      setupMockHandlerCreation();
      const { user } = renderWithSetup(<App />);

      await user.selectOptions(screen.getByLabelText('view'), 'month');

      const monthView = await screen.findByTestId('month-view');
      expect(monthView).toBeInTheDocument();

      const holidayCells = await screen.findAllByLabelText('holiday');
      const hasGaecheonjeol = holidayCells.some((cell) => cell.textContent?.includes('개천절'));
      expect(hasGaecheonjeol).toBe(true);
    });
  });
});

describe('검색 기능', () => {
  const sampleEvent = {
    id: '1',
    title: '팀 회의',
    date: '2024-10-17',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none' as const,
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  };

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation();
    const { user } = renderWithSetup(<App />);

    const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요/);
    await user.type(searchInput, '존재하지 않는 일정');

    expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출되고, '일반 회의'는 노출되지 않아야 한다", async () => {
    const events = [
      { ...sampleEvent, title: '팀 회의 1' },
      { ...sampleEvent, title: '일반 회의', id: '2' },
    ];
    setupMockHandlerUpdating(events);
    const { user } = renderWithSetup(<App />);

    const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요/);
    await user.type(searchInput, '팀 회의');

    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('팀 회의 1')).toBeInTheDocument();
    await waitFor(() => {
      expect(within(eventList).queryByText('일반 회의')).not.toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const events = [
      { ...sampleEvent, title: '팀 회의 1' },
      { ...sampleEvent, title: '일반 회의', id: '2' },
    ];
    setupMockHandlerUpdating(events);
    const { user } = renderWithSetup(<App />);

    const searchInput = screen.getByPlaceholderText(/검색어를 입력하세요/);

    await user.type(searchInput, '팀 회의');
    const eventList = await screen.findByTestId('event-list');
    expect(await within(eventList).findByText('팀 회의 1')).toBeInTheDocument();
    await waitFor(() => {
      expect(within(eventList).queryByText('일반 회의')).not.toBeInTheDocument();
    });

    await user.clear(searchInput);

    expect(await within(eventList).findByText('팀 회의 1')).toBeInTheDocument();
    expect(await within(eventList).findByText('일반 회의')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  const sampleEvent = {
    id: '1',
    title: '팀 회의',
    date: '2024-10-17',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none' as const,
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  };
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const existingEvent = {
      ...sampleEvent,
      startTime: '14:00',
      endTime: '15:00',
    };
    setupMockHandlerUpdating([existingEvent]);
    const { user } = renderWithSetup(<App />);

    await user.type(screen.getByLabelText(/제목/), '새로운 회의');
    await user.type(screen.getByLabelText(/날짜/), existingEvent.date);
    await user.type(screen.getByLabelText(/시작 시간/), '14:30');
    await user.type(screen.getByLabelText(/종료 시간/), '15:30');
    await user.type(screen.getByLabelText(/설명/), '설명');
    await user.type(screen.getByLabelText(/위치/), '위치');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '업무');

    await user.click(screen.getByRole('button', { name: /일정 추가/ }));

    expect(screen.getByText(/일정 겹침 경고/)).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const events = [
      { ...sampleEvent, startTime: '14:00', endTime: '15:00' },
      { ...sampleEvent, id: '2', title: '두 번째 회의', startTime: '16:00', endTime: '17:00' },
    ];
    setupMockHandlerUpdating(events);
    const { user } = renderWithSetup(<App />);

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[1]);

    await user.clear(screen.getByLabelText(/시작 시간/));
    await user.type(screen.getByLabelText(/시작 시간/), '14:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText(/일정 겹침 경고/)).toBeInTheDocument();
  });
});

describe('일정 알림 테스트', () => {
  const sampleEvent = {
    id: '1',
    title: '팀 회의',
    date: '2024-10-17',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none' as const,
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  };

  it('알림 설정을 10으로 하면 이벤트 시작 정확히 10분 전에 알림이 표시된다', async () => {
    vi.setSystemTime(new Date('2024-10-17T13:50:00'));
    setupMockHandlerUpdating([sampleEvent]);
    renderWithSetup(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('10분 후 팀 회의 일정이 시작됩니다.');
  });

  it('알림 설정을 10으로 하면 이벤트 시작 11분 전에는 알림이 표시되지 않는다', async () => {
    vi.setSystemTime(new Date('2024-10-17T13:49:00'));
    setupMockHandlerUpdating([sampleEvent]);
    renderWithSetup(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('알림 설정을 10으로 하면 10분 전부터 이벤트 시작 사이에 계속 알림이 표시된다', async () => {
    vi.setSystemTime(new Date('2024-10-17T13:55:00'));
    setupMockHandlerUpdating([sampleEvent]);
    renderWithSetup(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('10분 후 팀 회의 일정이 시작됩니다.');
  });

  it('이벤트 시작 시간이 지나면 알림이 표시되지 않는다', async () => {
    vi.setSystemTime(new Date('2024-10-17T14:01:00'));
    setupMockHandlerUpdating([sampleEvent]);
    renderWithSetup(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('알림 설정이 0인 경우 알림이 표시되지 않는다', async () => {
    const eventWithNoNotification = {
      ...sampleEvent,
      notificationTime: 0,
    };

    vi.setSystemTime(new Date('2024-10-17T13:50:00'));
    setupMockHandlerUpdating([eventWithNoNotification]);
    renderWithSetup(<App />);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});

describe('반복 일정 생성', () => {
  const sampleEvent = {
    id: '1',
    title: '테스트 회의',
    date: '2024-10-17',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: {
      type: 'none' as RepeatType,
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  };

  describe('반복 유형 선택', () => {
    it('날짜를 선택하지 않은 경우엔 반복 일정 체크박스가 disable 되며 반복 유형을 선택할 수 없다.', async () => {
      renderWithSetup(<App />);

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      expect(repeatCheckbox).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText('반복 유형')).not.toBeInTheDocument();
      });
    });

    it('날짜를 선택한 경우엔 반복 유형을 선택할 수 있다.', async () => {
      const { user } = renderWithSetup(<App />);

      const dateInput = screen.getByLabelText('날짜');
      await user.type(dateInput, '2024-03-15');

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);

      const repeatTypeSelect = await screen.findByLabelText('반복 유형');
      expect(repeatTypeSelect).toBeInTheDocument();

      const options = screen.getAllByRole('option');
      const repeatTypes = options.map((option) => option.textContent);
      expect(repeatTypes).toContain('매일');
      expect(repeatTypes).toContain('매주');
      expect(repeatTypes).toContain('매월');
      expect(repeatTypes).toContain('매년');
    });

    it('일정 수정 시에도 반복 유형을 변경할 수 있어야 한다.', async () => {
      setupMockHandlerUpdating([sampleEvent]);
      const { user } = renderWithSetup(<App />);

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      await user.click(repeatCheckbox);

      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.selectOptions(repeatTypeSelect, 'weekly');

      await user.click(screen.getByTestId('event-submit-button'));

      const events = await screen.findAllByText('테스트 회의');
      expect(events.length).toBeGreaterThan(1);
    });

  });

});
