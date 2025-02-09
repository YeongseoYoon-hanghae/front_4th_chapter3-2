import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  describe('잘못된 시간 입력 시', () => {
    it('시작 시간(10:00)이 종료 시간(09:00)보다 한 시간 늦을 때 에러 메시지를 반환한다', () => {
      const result = getTimeErrorMessage('10:00', '09:00');

      expect(result).toEqual({
        startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
        endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      });
    });

    it('시작 시간과 종료 시간이 모두 10:00으로 동일할 때 에러 메시지를 반환한다', () => {
      const result = getTimeErrorMessage('10:00', '10:00');

      expect(result).toEqual({
        startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
        endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      });
    });
  });

  describe('올바른 시간 입력 시', () => {
    it('시작 시간(09:00)이 종료 시간(10:00)보다 한 시간 빠를 때 에러가 없어야 한다', () => {
      const result = getTimeErrorMessage('09:00', '10:00');

      expect(result).toEqual({
        startTimeError: null,
        endTimeError: null,
      });
    });
  });

  describe('시간이 비어있는 경우', () => {
    it('시작 시간만 비어있고 종료 시간이 10:00일 때 에러가 없어야 한다', () => {
      const result = getTimeErrorMessage('', '10:00');

      expect(result).toEqual({
        startTimeError: null,
        endTimeError: null,
      });
    });

    it('종료 시간만 비어있고 시작 시간이 09:00일 때 에러가 없어야 한다', () => {
      const result = getTimeErrorMessage('09:00', '');

      expect(result).toEqual({
        startTimeError: null,
        endTimeError: null,
      });
    });

    it('시작 시간과 종료 시간이 모두 비어있을 때 에러가 없어야 한다', () => {
      const result = getTimeErrorMessage('', '');

      expect(result).toEqual({
        startTimeError: null,
        endTimeError: null,
      });
    });
  });
});
