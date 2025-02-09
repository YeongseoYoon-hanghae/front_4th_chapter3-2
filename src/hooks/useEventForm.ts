import { ChangeEvent, useState } from 'react';

import { Event, RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

interface FormState {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;
}

export const useEventForm = (initialEvent?: Event) => {
  const [formState, setFormState] = useState<FormState>({
    title: initialEvent?.title || '',
    date: initialEvent?.date || '',
    startTime: initialEvent?.startTime || '',
    endTime: initialEvent?.endTime || '',
    description: initialEvent?.description || '',
    location: initialEvent?.location || '',
    category: initialEvent?.category || '',
    isRepeating: initialEvent?.repeat.type !== 'none',
    repeatType: initialEvent?.repeat.type || 'none',
    repeatInterval: initialEvent?.repeat.interval || 1,
    repeatEndDate: initialEvent?.repeat.endDate || '',
    notificationTime: initialEvent?.notificationTime || 10,
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
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
    });
  };

  const editEvent = (event: Event | null) => {
    if (!event) {
      resetForm();
      return;
    }
    setFormState({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      description: event.description,
      location: event.location,
      category: event.category,
      isRepeating: event.repeat.type !== 'none',
      repeatType: event.repeat.type,
      repeatInterval: event.repeat.interval,
      repeatEndDate: event.repeat.endDate || '',
      notificationTime: event.notificationTime,
      startTimeError: null,
      endTimeError: null,
      editingEvent: event,
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
