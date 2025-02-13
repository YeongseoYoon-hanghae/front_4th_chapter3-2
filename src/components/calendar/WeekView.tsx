import { VStack, Heading, Table, Text, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react';

import { EventBox } from './EventBox';
import { WEEK_DAYS } from '../../policy';
import { Event } from '../../types';
import { formatWeek, getWeekDates } from '../../utils/dateUtils';

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
}

export const WeekView = ({ currentDate, events, notifiedEvents }: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
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
          <Tr>
            {weekDates.map((date) => (
              <Td key={date.toISOString()} height="100px" verticalAlign="top" width="14.28%">
                <Text fontWeight="bold">{date.getDate()}</Text>
                {events
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => {
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
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
