import { BellIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { Box, HStack, Text } from '@chakra-ui/react';

import { Event } from '../../types';

interface EventBoxProps {
  event: Event;
  isNotified?: boolean;
  isRepeating?: boolean;
}

export const EventBox = ({ event, isNotified = false, isRepeating = false }: EventBoxProps) => {
  return (
    <Box
      p={1}
      my={1}
      bg={isNotified ? 'red.100' : isRepeating ? 'blue.300' : 'gray.100'}
      borderRadius="md"
      fontWeight={isNotified ? 'bold' : 'normal'}
      color={isNotified ? 'red.500' : isRepeating ? 'white' : 'inherit'}
      aria-label="event-box"
    >
      <HStack spacing={1}>
        {isNotified && <BellIcon aria-label="bell-icon" />}
        {!isNotified && isRepeating && <RepeatClockIcon aria-label="repeat-clock-icon" />}
        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>
      </HStack>
    </Box>
  );
};
