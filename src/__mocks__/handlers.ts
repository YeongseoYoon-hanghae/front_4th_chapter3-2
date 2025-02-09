import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const eventData = (await request.json()) as Event;
    const { id: _id, ...eventDataWithoutId } = eventData;
    const newEvent = {
      id: randomUUID(),
      ...eventDataWithoutId,
    };
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const updateData = (await request.json()) as Event;
    const eventIndex = events.findIndex((event) => event.id === params.id);

    if (eventIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedEvent = {
      ...events[eventIndex],
      ...updateData,
    };

    return HttpResponse.json(updatedEvent);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const eventExists = events.some((event) => event.id === params.id);

    if (!eventExists) {
      return new HttpResponse(null, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
