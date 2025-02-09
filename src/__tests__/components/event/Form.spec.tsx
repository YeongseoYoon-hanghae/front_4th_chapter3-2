import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { EventForm } from '../../../components/event/Form';
import { CATEGORIES, NOTIFICATION_OPTIONS } from '../../../policy';
import { FormState, RepeatType } from '../../../types';
import { renderWithSetup } from '../../test-utils';

describe('EventForm', () => {
  const mockFormState: FormState = {
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    location: '',
    category: '',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 0,
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
  };

  const mockHandlers = {
    updateFormState: vi.fn(),
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    resetForm: vi.fn(),
    editEvent: vi.fn(),
  };

  const defaultProps = {
    formState: mockFormState,
    formHandlers: mockHandlers,
    onSubmit: vi.fn(),
  };

  describe('기본 렌더링', () => {
    it('새 일정 추가 모드에서는 "일정 추가" 헤더와 버튼이 표시된다', () => {
      renderWithSetup(<EventForm {...defaultProps} />);

      expect(screen.getByRole('heading')).toHaveTextContent('일정 추가');
      expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 추가');
    });

    it('일정 수정 모드에서는 "일정 수정" 헤더와 버튼이 표시된다', () => {
      const editingFormState = {
        ...mockFormState,
        editingEvent: {
          id: '1',
          title: '기존 일정',
          date: '2024-03-20',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '',
          notificationTime: 0,
          isRepeating: false,
          repeat: {
            type: 'none' as RepeatType,
            interval: 1,
            endDate: '',
          },
        },
      };
      renderWithSetup(<EventForm {...defaultProps} formState={editingFormState} />);

      expect(screen.getByRole('heading')).toHaveTextContent('일정 수정');
      expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 수정');
    });

    it('모든 필수 입력 필드가 표시된다', () => {
      renderWithSetup(<EventForm {...defaultProps} />);

      expect(screen.getByLabelText('제목')).toBeInTheDocument();
      expect(screen.getByLabelText('날짜')).toBeInTheDocument();
      expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('설명')).toBeInTheDocument();
      expect(screen.getByLabelText('위치')).toBeInTheDocument();
      expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    });
  });

  describe('카테고리 선택', () => {
    it('모든 카테고리 옵션이 표시된다', () => {
      renderWithSetup(<EventForm {...defaultProps} />);

      const categorySelect = screen.getByLabelText('카테고리');
      CATEGORIES.forEach((category) => {
        expect(categorySelect).toHaveTextContent(category);
      });
    });
  });

  describe('알림 설정', () => {
    it('모든 알림 옵션이 표시된다', () => {
      renderWithSetup(<EventForm {...defaultProps} />);

      const notificationSelect = screen.getByLabelText('알림 설정');
      NOTIFICATION_OPTIONS.forEach((option) => {
        expect(notificationSelect).toHaveTextContent(option.label);
      });
    });
  });

  describe('반복 설정', () => {
    it('반복 설정 체크박스를 선택하면 추가 설정이 표시된다', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithSetup(<EventForm {...defaultProps} />);

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);

      expect(mockHandlers.updateFormState).toHaveBeenCalledWith({ isRepeating: true });

      rerender(<EventForm {...defaultProps} formState={{ ...mockFormState, isRepeating: true }} />);

      expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
      expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
    });

    it('반복 유형 변경 시 updateFormState가 호출된다', async () => {
      const user = userEvent.setup();
      renderWithSetup(
        <EventForm {...defaultProps} formState={{ ...mockFormState, isRepeating: true }} />
      );

      await user.selectOptions(screen.getByLabelText('반복 유형'), 'weekly');
      expect(mockHandlers.updateFormState).toHaveBeenCalledWith({ repeatType: 'weekly' });
    });
  });

  describe('시간 에러 처리', () => {
    it('시작 시간 에러가 있으면 툴팁이 표시된다', () => {
      const errorFormState = {
        ...mockFormState,
        startTimeError: '시작 시간이 잘못되었습니다',
      };
      renderWithSetup(<EventForm {...defaultProps} formState={errorFormState} />);

      expect(screen.getByText('시작 시간이 잘못되었습니다')).toBeInTheDocument();
    });

    it('종료 시간 에러가 있으면 툴팁이 표시된다', () => {
      const errorFormState = {
        ...mockFormState,
        endTimeError: '종료 시간이 잘못되었습니다',
      };
      renderWithSetup(<EventForm {...defaultProps} formState={errorFormState} />);

      expect(screen.getByText('종료 시간이 잘못되었습니다')).toBeInTheDocument();
    });
  });

  describe('폼 제출', () => {
    it('제출 버튼 클릭 시 onSubmit이 호출된다', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderWithSetup(<EventForm {...defaultProps} onSubmit={onSubmit} />);

      await user.click(screen.getByTestId('event-submit-button'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
