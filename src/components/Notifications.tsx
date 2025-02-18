import { Alert, AlertIcon, AlertTitle, Box, CloseButton, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';

interface NotificationsProps {
  notifications: { id: string; message: string }[];
  setNotifications: Dispatch<SetStateAction<{ id: string; message: string }[]>>;
}

export const Notifications = ({ notifications, setNotifications }: NotificationsProps) => {
  return (
    <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
      {notifications.map((notification, index) => (
        <Alert key={index} status="info" variant="solid" width="auto">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
          </Box>
          <CloseButton
            onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
          />
        </Alert>
      ))}
    </VStack>
  );
};
