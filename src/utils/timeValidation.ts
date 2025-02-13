export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
  console.log('getTimeErrorMessage 입력값:', start, end); // 함수로 전달된 원래 값 확인

  if (!start || !end) {
    return { startTimeError: null, endTimeError: null };
  }

  if (start >= end) {
    return {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    };
  }

  return { startTimeError: null, endTimeError: null };
}
