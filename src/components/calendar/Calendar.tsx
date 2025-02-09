import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Heading, HStack, IconButton, Select, VStack } from '@chakra-ui/react';

import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { Event } from '../../types';

interface CalendarProps {
  events: Event[];
  notifiedEvents: string[];
  view: 'week' | 'month';
  currentDate: Date;
  holidays: Record<string, string>;
  onViewChange: (view: 'week' | 'month') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const Calendar = ({
  events,
  notifiedEvents,
  view,
  currentDate,
  holidays,
  onViewChange,
  onNavigate,
}: CalendarProps) => {
  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>

      <HStack mx="auto" justifyContent="space-between">
        <IconButton
          aria-label="Previous"
          icon={<ChevronLeftIcon />}
          onClick={() => onNavigate('prev')}
        />
        <Select
          aria-label="view"
          value={view}
          onChange={(e) => onViewChange(e.target.value as 'week' | 'month')}
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
        </Select>
        <IconButton
          aria-label="Next"
          icon={<ChevronRightIcon />}
          onClick={() => onNavigate('next')}
        />
      </HStack>

      {view === 'week' ? (
        <WeekView currentDate={currentDate} events={events} notifiedEvents={notifiedEvents} />
      ) : (
        <MonthView
          currentDate={currentDate}
          events={events}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </VStack>
  );
};
