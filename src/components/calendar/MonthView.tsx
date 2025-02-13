import { VStack, Heading, Table, Text, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react';

import { EventBox } from './EventBox';
import { WEEK_DAYS } from '../../policy';
import { Event } from '../../types';
import { getWeeksAtMonth, formatMonth, formatDate, getEventsForDay } from '../../utils/dateUtils';

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
}

export const MonthView = ({ currentDate, events, notifiedEvents, holidays }: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <VStack data-testid="month-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatMonth(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <Tr>
            {WEEK_DAYS.map((day) => (
              <Th key={day} width="14.28%">
                {day}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {weeks.map((week, weekIndex) => (
            <Tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                const dateString = day ? formatDate(currentDate, day) : '';
                const holiday = holidays[dateString];

                return (
                  <Td
                    key={dayIndex}
                    height="100px"
                    verticalAlign="top"
                    width="14.28%"
                    position="relative"
                  >
                    {day && (
                      <>
                        <Text fontWeight="bold">{day}</Text>
                        {holiday && (
                          <Text color="red.500" fontSize="sm" aria-label="holiday">
                            {holiday}
                          </Text>
                        )}
                        {getEventsForDay(events, day).map((event) => {
                          const isNotified = notifiedEvents.includes(event.id || '');
                          const isRepeating = !!event.repeat.type && event.repeat.type !== 'none';
                          return (
                            <EventBox
                              key={event.id}
                              event={event}
                              isNotified={isNotified}
                              isRepeating={isRepeating}
                            />
                          );
                        })}
                      </>
                    )}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
};
