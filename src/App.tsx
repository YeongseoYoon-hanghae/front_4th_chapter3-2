import { Box, Flex, useToast } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { Calendar } from './components/calendar/Calendar.tsx';
import { EventForm } from './components/event/Form.tsx';
import { EventList } from './components/event/List.tsx';
import { Notifications } from './components/Notifications.tsx';
import { OverlapDialog } from './components/OverlapDialog';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventFormType } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
  const { formState, formHandlers } = useEventForm();
  const { events, saveEvent, deleteEvent } = useEventOperations(
    Boolean(formState.editingEvent),
    () => formHandlers.editEvent(null)
  );
  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, currentDate, holidays, setView, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const toast = useToast();

  const addOrUpdateEvent = async () => {
    if (!formState.title || !formState.date || !formState.startTime || !formState.endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formState.startTimeError || formState.endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventFormType = {
      id: formState.editingEvent ? formState.editingEvent.id : undefined,
      title: formState.title,
      date: formState.date,
      startTime: formState.startTime,
      endTime: formState.endTime,
      description: formState.description,
      location: formState.location,
      category: formState.category,
      repeat: {
        type: formState.isRepeating ? formState.repeatType : 'none',
        interval: formState.repeatInterval,
        endDate: formState.repeatEndDate || undefined,
      },
      notificationTime: formState.notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      formHandlers.resetForm();
    }
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm formState={formState} formHandlers={formHandlers} onSubmit={addOrUpdateEvent} />

        <Calendar
          events={filteredEvents}
          notifiedEvents={notifiedEvents}
          view={view}
          currentDate={currentDate}
          holidays={holidays}
          onViewChange={setView}
          onNavigate={navigate}
        />

        <EventList
          events={filteredEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          notifiedEvents={notifiedEvents}
          onEdit={formHandlers.editEvent}
          onDelete={deleteEvent}
        />
      </Flex>

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        cancelRef={cancelRef}
        onConfirm={() => {
          setIsOverlapDialogOpen(false);
          saveEvent({
            id: formState.editingEvent ? formState.editingEvent.id : undefined,
            title: formState.title,
            date: formState.date,
            startTime: formState.startTime,
            endTime: formState.endTime,
            description: formState.description,
            location: formState.location,
            category: formState.category,
            repeat: {
              type: formState.isRepeating ? formState.repeatType : 'none',
              interval: formState.repeatInterval,
              endDate: formState.repeatEndDate || undefined,
            },
            notificationTime: formState.notificationTime,
          });
        }}
      />

      {notifications.length > 0 && (
        <Notifications notifications={notifications} setNotifications={setNotifications} />
      )}
    </Box>
  );
}

export default App;
