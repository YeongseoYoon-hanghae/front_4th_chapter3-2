import { ChangeEvent } from 'react';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  pattern?: RepeatPattern;
  repeatEnd?: RepeatEnd;
}

export interface Event {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number; // 분 단위로 저장
}

export interface Notification {
  id: string;
  message: string;
}

export type RepeatPattern = 'exact' | 'nthWeekday' | 'lastWeekday' | 'lastDay';

export type RepeatEnd = 'never' | 'endDate' | 'endCount';

export interface FormState {
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
  repeatPattern?: RepeatPattern;
  repeatEnd: RepeatEnd;
  notificationTime: number;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;
}

export interface FormHandlers {
  updateFormState: (updates: Partial<FormState>) => void;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
  editEvent: (event: Event | null) => void;
}
