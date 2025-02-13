import { VStack, FormControl, FormLabel, Input, Text } from '@chakra-ui/react';

import { EventItem } from './Item';
import { Event } from '../../types';

interface EventListProps {
  events: Event[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  notifiedEvents: string[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventList = ({
  events,
  searchTerm,
  setSearchTerm,
  notifiedEvents,
  onEdit,
  onDelete,
}: EventListProps) => {
  return (
    <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
      <FormControl>
        <FormLabel>일정 검색</FormLabel>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>

      {events.length === 0 ? (
        <Text>검색 결과가 없습니다.</Text>
      ) : (
        events.map((event) => {
          const isRepeating = !!event.repeat.type && event.repeat.type !== 'none';
          const isNotified = notifiedEvents.includes(event.id || '');
          return (
            <EventItem
              key={event.id}
              event={event}
              isNotified={isNotified}
              onEdit={() => onEdit(event)}
              onDelete={() => onDelete(event.id || '')}
              isRepeating={isRepeating}
            />
          );
        })
      )}
    </VStack>
  );
};
