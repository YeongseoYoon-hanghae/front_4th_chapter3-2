import {
  VStack,
  FormControl,
  FormLabel,
  Select,
  HStack,
  Input,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';

import { FormState, RepeatPattern, RepeatEnd, RepeatType } from '../../types';
import { isLastDayOfMonth, isLastWeekOfMonth } from '../../utils/dateUtils';

interface RepeatSettingProps {
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  repeatEnd: RepeatEnd;
  selectedDate: string;
  updateFormState: (state: Partial<FormState>) => void;
}

const RepeatSetting = ({
  repeatType,
  repeatInterval,
  repeatEndDate,
  repeatEnd,
  selectedDate,
  updateFormState,
}: RepeatSettingProps) => {
  const getRepeatOptions = () => {
    const date = new Date(selectedDate);
    const day = date.getDate();
    const month = date.getMonth();
    const weekday = date.getDay();
    const weekNum = Math.ceil(day / 7);
    const weekdayName = ['일', '월', '화', '수', '목', '금', '토'][weekday];
    const monthName = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'][month];

    if (!['monthly', 'yearly'].includes(repeatType)) {
      return null;
    }

    if (isLastDayOfMonth(date) && repeatType === 'yearly') {
      return (
        <FormControl>
          <FormLabel>반복 패턴</FormLabel>
          <RadioGroup
            defaultValue="exact"
            onChange={(value: RepeatPattern) => updateFormState({ repeatPattern: value })}
          >
            <VStack align="start">
              <Radio value="exact">{`${monthName}월 ${day}일`}</Radio>
              <Radio value="nthWeekday">{`${monthName}월 ${weekNum}번째 ${weekdayName}요일`}</Radio>
              <Radio value="lastWeekday">{`${monthName}월 마지막 ${weekdayName}요일`}</Radio>
              <Radio value="lastDay">{`${monthName}월 마지막 날`}</Radio>
            </VStack>
          </RadioGroup>
        </FormControl>
      );
    }

    if (isLastWeekOfMonth(date) && !isLastDayOfMonth(date)) {
      if (repeatType === 'yearly') {
        return (
          <FormControl>
            <FormLabel>반복 패턴</FormLabel>
            <RadioGroup
              defaultValue="exact"
              onChange={(value: RepeatPattern) => updateFormState({ repeatPattern: value })}
            >
              <VStack align="start">
                <Radio value="exact">{`${monthName}월 ${day}일`}</Radio>
                <Radio value="nthWeekday">{`${monthName}월 ${weekNum}번째 ${weekdayName}요일`}</Radio>
                <Radio value="lastWeekday">{`${monthName}월 마지막 ${weekdayName}요일`}</Radio>
              </VStack>
            </RadioGroup>
          </FormControl>
        );
      }

      if (repeatType === 'monthly') {
        return (
          <FormControl>
            <FormLabel>반복 패턴</FormLabel>
            <RadioGroup
              defaultValue="exact"
              onChange={(value: RepeatPattern) => updateFormState({ repeatPattern: value })}
            >
              <VStack align="start">
                <Radio value="exact">{`${day}일`}</Radio>
                <Radio value="nthWeekday">{`${weekNum}번째 ${weekdayName}요일`}</Radio>
                <Radio value="lastWeekday">{`마지막 ${weekdayName}요일`}</Radio>
              </VStack>
            </RadioGroup>
          </FormControl>
        );
      }
    }

    if (isLastWeekOfMonth(date) && isLastDayOfMonth(date) && repeatType === 'monthly') {
      return (
        <FormControl>
          <FormLabel>반복 패턴</FormLabel>
          <RadioGroup
            defaultValue="exact"
            onChange={(value: RepeatPattern) => updateFormState({ repeatPattern: value })}
          >
            <VStack align="start">
              <Radio value="exact">{`${day}일`}</Radio>
              <Radio value="nthWeekday">{`${weekNum}번째 ${weekdayName}요일`}</Radio>
              <Radio value="lastWeekday">{`마지막 ${weekdayName}요일`}</Radio>
              <Radio value="lastDay">마지막 날</Radio>
            </VStack>
          </RadioGroup>
        </FormControl>
      );
    }

    if (!isLastWeekOfMonth(date)) {
      if (repeatType === 'monthly') {
        return (
          <FormControl>
            <FormLabel>반복 패턴</FormLabel>
            <RadioGroup
              defaultValue="exact"
              onChange={(value: RepeatPattern) => updateFormState({ repeatPattern: value })}
            >
              <VStack align="start">
                <Radio value="exact">{`${day}일`}</Radio>
                <Radio value="nthWeekday">{`${weekNum}번째 ${weekdayName}요일`}</Radio>
              </VStack>
            </RadioGroup>
          </FormControl>
        );
      }

      if (repeatType === 'yearly') {
        return (
          <FormControl>
            <FormLabel>반복 패턴</FormLabel>
            <RadioGroup
              defaultValue="exact"
              onChange={(value: RepeatPattern) => updateFormState({ repeatPattern: value })}
            >
              <VStack align="start">
                <Radio value="exact">{`${monthName}월 ${day}일`}</Radio>
                <Radio value="nthWeekday">{`${monthName}월 ${weekNum}번째 ${weekdayName}요일`}</Radio>
              </VStack>
            </RadioGroup>
          </FormControl>
        );
      }
    }

    return null;
  };

  return (
    <VStack width="100%">
      <FormControl>
        <FormLabel>반복 유형</FormLabel>
        <Select
          value={repeatType}
          onChange={(e) => updateFormState({ repeatType: e.target.value as RepeatType })}
        >
          <option value="daily">매일</option>
          <option value="weekly">매주</option>
          <option value="monthly">매월</option>
          <option value="yearly">매년</option>
        </Select>
      </FormControl>

      {getRepeatOptions()}

      <HStack width="100%">
        <FormControl>
          <FormLabel>반복 간격</FormLabel>
          <Input
            type="number"
            value={repeatInterval}
            onChange={(e) => updateFormState({ repeatInterval: Number(e.target.value) })}
            min={1}
          />
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>반복 종료</FormLabel>
        <RadioGroup
          defaultValue="never"
          onChange={(value: RepeatEnd) => updateFormState({ repeatEnd: value })}
        >
          <VStack align="start">
            <Radio value="never">없음</Radio>
            <Radio value="endDate">날짜</Radio>
            {repeatEnd === 'endDate' && (
              <FormControl>
                <FormLabel>반복 종료일</FormLabel>
                <Input
                  type="date"
                  value={repeatEndDate}
                  onChange={(e) => updateFormState({ repeatEndDate: e.target.value })}
                />
              </FormControl>
            )}

            <Radio value="endCount">횟수</Radio>
          </VStack>
        </RadioGroup>
      </FormControl>
    </VStack>
  );
};

export default RepeatSetting;
