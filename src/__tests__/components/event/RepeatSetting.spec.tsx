import { screen, fireEvent } from '@testing-library/react';

import RepeatSetting from '../../../components/event/RepeatSetting';
import { RepeatType } from '../../../types';
import { renderWithSetup } from '../../test-utils';

describe('RepeatSetting', () => {
  const mockProps = {
    repeatType: 'daily' as RepeatType,
    repeatInterval: 1,
    repeatEndDate: '2024-02-09',
    updateFormState: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 기능 테스트', () => {
    it('모든 필수 입력 필드가 렌더링되어야 한다', () => {
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
});
