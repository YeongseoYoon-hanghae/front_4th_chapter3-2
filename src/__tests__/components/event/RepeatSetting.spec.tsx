import { screen, fireEvent } from '@testing-library/react';

import RepeatSetting from '../../../components/event/RepeatSetting';
import { RepeatEnd, RepeatType } from '../../../types';
import { renderWithSetup } from '../../test-utils';

describe('RepeatSetting', () => {
  const mockProps = {
    repeatType: 'daily' as RepeatType,
    repeatInterval: 1,
    repeatEndDate: '2024-02-09',
    updateFormState: vi.fn(),
    selectedDate: '2024-02-08',
    repeatEnd: 'endDate' as RepeatEnd,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 기능 테스트', () => {
    it('기본적인 반복 설정 필드들이 렌더링되어야 한다', () => {
      renderWithSetup(<RepeatSetting {...mockProps} />);

      expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
      expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
    });

    it('반복 유형 변경 시 updateFormState가 호출되어야 한다', () => {
      renderWithSetup(<RepeatSetting {...mockProps} />);

      const select = screen.getByLabelText('반복 유형');
      fireEvent.change(select, { target: { value: 'weekly' } });

      expect(mockProps.updateFormState).toHaveBeenCalledWith({
        repeatType: 'weekly',
      });
    });

    it('반복 간격 변경 시 updateFormState가 호출되어야 한다', () => {
      renderWithSetup(<RepeatSetting {...mockProps} />);

      const input = screen.getByLabelText('반복 간격');
      fireEvent.change(input, { target: { value: '2' } });

      expect(mockProps.updateFormState).toHaveBeenCalledWith({
        repeatInterval: 2,
      });
    });

    it('반복 종료일 변경 시 updateFormState가 호출되어야 한다', () => {
      renderWithSetup(<RepeatSetting {...mockProps} />);

      const input = screen.getByLabelText('반복 종료일');
      fireEvent.change(input, { target: { value: '2024-03-09' } });

      expect(mockProps.updateFormState).toHaveBeenCalledWith({
        repeatEndDate: '2024-03-09',
      });
    });

    it('반복 간격은 1 미만의 값을 입력할 수 없어야 한다', () => {
      renderWithSetup(<RepeatSetting {...mockProps} />);

      const input = screen.getByLabelText('반복 간격');
      expect(input).toHaveAttribute('min', '1');
    });
  });

  describe('월간 반복 패턴', () => {
    it('일반적인 날짜의 경우 기본 옵션만 표시된다', () => {
      renderWithSetup(<RepeatSetting {...mockProps} repeatType="monthly" />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(2);
      expect(screen.getByText('8일')).toBeInTheDocument();
      expect(screen.getByText('2번째 목요일')).toBeInTheDocument();
    });

    it('마지막 주의 날짜인 경우 마지막 요일 옵션이 추가된다', () => {
      renderWithSetup(
        <RepeatSetting {...mockProps} repeatType="monthly" selectedDate="2024-02-28" />
      );

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(3);
      expect(screen.getByText('28일')).toBeInTheDocument();
      expect(screen.getByText('4번째 수요일')).toBeInTheDocument();
      expect(screen.getByText('마지막 수요일')).toBeInTheDocument();
    });

    it('마지막 날짜인 경우 마지막 날 옵션이 추가된다', () => {
      renderWithSetup(
        <RepeatSetting {...mockProps} repeatType="monthly" selectedDate="2024-02-29" />
      );

      expect(screen.getByText('마지막 날')).toBeInTheDocument();
    });
  });

  describe('연간 반복 패턴', () => {
    it('일반적인 날짜의 경우 기본 옵션만 표시된다', () => {
      renderWithSetup(<RepeatSetting {...mockProps} repeatType="yearly" />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(2);
      expect(screen.getByText('2월 8일')).toBeInTheDocument();
      expect(screen.getByText('2월 2번째 목요일')).toBeInTheDocument();
    });

    it('마지막 날짜인 경우 모든 옵션이 표시된다', () => {
      renderWithSetup(
        <RepeatSetting {...mockProps} repeatType="yearly" selectedDate="2024-02-29" />
      );

      expect(screen.getByText('2월 29일')).toBeInTheDocument();
      expect(screen.getByText('2월 5번째 목요일')).toBeInTheDocument();
      expect(screen.getByText('2월 마지막 목요일')).toBeInTheDocument();
      expect(screen.getByText('2월 마지막 날')).toBeInTheDocument();
    });
  });
});
