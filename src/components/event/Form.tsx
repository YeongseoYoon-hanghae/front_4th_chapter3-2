import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Button,
  Heading,
  HStack,
  Tooltip,
} from '@chakra-ui/react';

import RepeatSetting from './RepeatSetting';
import { CATEGORIES, NOTIFICATION_OPTIONS } from '../../policy';
import { FormState, FormHandlers } from '../../types';

interface EventFormProps {
  formState: FormState;
  formHandlers: FormHandlers;
  onSubmit: () => void;
}

export const EventForm = ({ formState, formHandlers, onSubmit }: EventFormProps) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    notificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
  } = formState;

  const { updateFormState, handleStartTimeChange, handleEndTimeChange } = formHandlers;

  return (
    <VStack w="400px" spacing={5} align="stretch">
      <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

      <FormControl>
        <FormLabel>제목</FormLabel>
        <Input value={title} onChange={(e) => updateFormState({ title: e.target.value })} />
      </FormControl>

      <FormControl>
        <FormLabel>날짜</FormLabel>
        <Input
          type="date"
          value={date}
          onChange={(e) => updateFormState({ date: e.target.value })}
        />
      </FormControl>

      <HStack width="100%">
        <FormControl>
          <FormLabel>시작 시간</FormLabel>
          <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
            <Input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              isInvalid={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl>
          <FormLabel>종료 시간</FormLabel>
          <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
            <Input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              isInvalid={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>설명</FormLabel>
        <Input
          value={description}
          onChange={(e) => updateFormState({ description: e.target.value })}
        />
      </FormControl>

      <FormControl>
        <FormLabel>위치</FormLabel>
        <Input value={location} onChange={(e) => updateFormState({ location: e.target.value })} />
      </FormControl>

      <FormControl>
        <FormLabel>카테고리</FormLabel>
        <Select value={category} onChange={(e) => updateFormState({ category: e.target.value })}>
          <option value="">카테고리 선택</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox
          isChecked={isRepeating}
          onChange={(e) => updateFormState({ isRepeating: e.target.checked })}
        >
          반복 일정
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>알림 설정</FormLabel>
        <Select
          value={notificationTime}
          onChange={(e) => updateFormState({ notificationTime: Number(e.target.value) })}
        >
          {NOTIFICATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>

      {isRepeating && (
        <RepeatSetting
          repeatType={formState.repeatType}
          repeatInterval={formState.repeatInterval}
          repeatEndDate={formState.repeatEndDate}
          updateFormState={updateFormState}
        />
      )}

      <Button data-testid="event-submit-button" onClick={onSubmit} colorScheme="blue">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </VStack>
  );
};
