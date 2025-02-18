import { BellIcon, DeleteIcon, EditIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { Box, HStack, VStack, Text, IconButton } from '@chakra-ui/react';

import { NOTIFICATION_OPTIONS } from '../../policy';
import { Event } from '../../types';

interface EventItemProps {
  event: Event;
  isRepeating?: boolean;
  isNotified?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const EventItem = ({
  event,
  isNotified = false,
  onEdit,
  onDelete,
  isRepeating = false,
}: EventItemProps) => {
  return (
    <Box borderWidth={1} borderRadius="lg" p={3} width="100%">
      <HStack justifyContent="space-between">
        <VStack align="start">
          <HStack>
            {isNotified && <BellIcon color="red.500" aria-label="bell-icon" />}
            {!isNotified && isRepeating && (
              <RepeatClockIcon color="blue.300" aria-label="repeat-clock-icon" />
            )}
            <Text
              fontWeight={isNotified ? 'bold' : 'normal'}
              color={isNotified ? 'red.500' : isRepeating ? 'blue.300' : 'inherit'}
            >
              {event.title}
            </Text>
          </HStack>
          <Text>{event.date}</Text>
          <Text>
            {event.startTime} - {event.endTime}
          </Text>
          <Text>{event.description}</Text>
          <Text>{event.location}</Text>
          <Text>카테고리: {event.category}</Text>
          {event.repeat.type !== 'none' && (
            <Text>
              반복: {event.repeat.interval}
              {event.repeat.type === 'daily' && '일'}
              {event.repeat.type === 'weekly' && '주'}
              {event.repeat.type === 'monthly' && '월'}
              {event.repeat.type === 'yearly' && '년'}
              마다
              {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
            </Text>
          )}
          <Text>
            알림:{' '}
            {NOTIFICATION_OPTIONS.find((option) => option.value === event.notificationTime)?.label}
          </Text>
        </VStack>
        <HStack>
          <IconButton aria-label="Edit event" icon={<EditIcon />} onClick={onEdit} />
          <IconButton aria-label="Delete event" icon={<DeleteIcon />} onClick={onDelete} />
        </HStack>
      </HStack>
    </Box>
  );
};
