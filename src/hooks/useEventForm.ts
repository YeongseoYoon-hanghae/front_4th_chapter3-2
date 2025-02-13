import { ChangeEvent, useState } from 'react';

import { Event, FormState } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

export const useEventForm = (initialEvent?: Event) => {
  const [formState, setFormState] = useState<FormState>({
    title: initialEvent?.title || '',
    date: initialEvent?.date || '',
    startTime: initialEvent?.startTime || '',
    endTime: initialEvent?.endTime || '',
    description: initialEvent?.description || '',
    location: initialEvent?.location || '',
    category: initialEvent?.category || '',
    isRepeating: initialEvent ? initialEvent.repeat.type !== 'none' : false,
    repeatType: initialEvent?.repeat.type || 'none',
    repeatInterval: initialEvent?.repeat.interval || 1,
    repeatEndDate: initialEvent?.repeat.endDate || '',
    repeatPattern: initialEvent?.repeat.pattern || 'exact',
    notificationTime: initialEvent?.notificationTime || 10,
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
    repeatEnd: initialEvent?.repeat.repeatEnd || 'never',
    repeatEndCount: initialEvent?.repeat.endCount || 1,
  });

  const updateFormState = (updates: Partial<FormState>) => {
    setFormState((current) => ({ ...current, ...updates }));
  };

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    const timeErrors = getTimeErrorMessage(newStartTime, formState.endTime);
    updateFormState({
      startTime: newStartTime,
      startTimeError: timeErrors.startTimeError,
      endTimeError: timeErrors.endTimeError,
    });
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    const timeErrors = getTimeErrorMessage(formState.startTime, newEndTime);
    updateFormState({
      endTime: newEndTime,
      startTimeError: timeErrors.startTimeError,
      endTimeError: timeErrors.endTimeError,
    });
  };

  const resetForm = () => {
    setFormState({
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
      notificationTime: 10,
      startTimeError: null,
      endTimeError: null,
      editingEvent: null,
      repeatEnd: 'never',
      repeatEndCount: 1,
    });
  };

  const editEvent = (event: Event | null) => {
    if (!event) {
      resetForm();
      return;
    }

    setFormState({
      ...event,
      editingEvent: event,
      isRepeating: event.repeat.type !== 'none' && event.repeat?.type !== undefined,
      repeatType: event.repeat?.type || 'none',
      repeatInterval: event.repeat?.interval || 1,
      repeatEndDate: event.repeat?.endDate || '',
      repeatEnd: event.repeat?.repeatEnd || 'never',
      notificationTime: event.notificationTime,
      startTimeError: null,
      endTimeError: null,
      repeatEndCount: event.repeat?.endCount || 1,
    });
  };

  return {
    formState,
    formHandlers: {
      updateFormState,
      handleStartTimeChange,
      handleEndTimeChange,
      resetForm,
      editEvent,
    },
  };
};
