import { Event, RepeatPattern, RepeatType } from '../types';

type GenerateRepeatedEventsOptions = {
  baseEvent: Event;
  repeatType: RepeatType;
  interval: number;
  endDate: string;
  repeatPattern?: RepeatPattern;
  endCount?: number;
};

export const generateRepeatEvents = (options: GenerateRepeatedEventsOptions): Event[] => {
  const { baseEvent, repeatType, interval, endDate, repeatPattern } = options;
  const generatedEvents: Event[] = [];
  const eventStartDate = DateUtils.initializeDate(baseEvent.date);
  const eventEndDate = DateUtils.initializeDate(endDate);
  let iterationDate = new Date(eventStartDate);

  const addEventToList = (eventDate: Date) => {
    generatedEvents.push(
      createEventWithRepeat(baseEvent, eventDate, repeatType, interval, endDate)
    );
  };

  while (iterationDate <= eventEndDate) {
    if (repeatType === 'daily') {
      addEventToList(iterationDate);
      iterationDate = new Date(iterationDate.setDate(iterationDate.getDate() + interval));
    } else if (repeatType === 'weekly') {
      addEventToList(iterationDate);
      iterationDate = new Date(iterationDate.setDate(iterationDate.getDate() + 7 * interval));
    } else if (repeatType === 'monthly' && repeatPattern) {
      const iterationMonth = iterationDate.getMonth();
      const iterationYear = iterationDate.getFullYear();

      switch (repeatPattern) {
        case 'exact': {
          const formattedIterationDate = DateUtils.generateFormattedDate(iterationDate);
          if (DateUtils.isValidDateFormat(formattedIterationDate)) {
            addEventToList(iterationDate);
          }

          const newMonth = iterationDate.getMonth() + interval;
          const newYear = iterationDate.getFullYear() + Math.floor(newMonth / 12);
          const normalizedMonth = newMonth % 12;

          const targetDate = eventStartDate.getDate();
          const lastDayOfMonth = new Date(Date.UTC(newYear, normalizedMonth + 1, 0)).getDate();

          const nextDate = new Date(Date.UTC(newYear, normalizedMonth, targetDate));

          if (lastDayOfMonth >= targetDate && nextDate <= eventEndDate) {
            addEventToList(nextDate);
          }

          iterationDate = new Date(Date.UTC(newYear, normalizedMonth + 1, targetDate));
          break;
        }
        case 'lastDay': {
          const monthLastDay = DateUtils.createUTCDate(
            iterationYear,
            iterationMonth + 1,
            0
          ).getDate();
          if (iterationDate.getDate() === monthLastDay) {
            addEventToList(iterationDate);
          }

          const newMonth = iterationDate.getMonth() + interval;
          const newYear = iterationDate.getFullYear() + Math.floor(newMonth / 12);
          const normalizedMonth = newMonth % 12;

          const nextDate = new Date(Date.UTC(newYear, normalizedMonth + 1, 0));

          iterationDate = nextDate;
          break;
        }
        case 'lastWeekday': {
          const originalWeekday = eventStartDate.getDay();
          const lastWeekdayOfMonth = DateUtils.findLastWeekday(iterationDate, originalWeekday);

          if (lastWeekdayOfMonth <= eventEndDate) {
            addEventToList(lastWeekdayOfMonth);
          }

          iterationDate = DateUtils.createUTCDate(
            lastWeekdayOfMonth.getFullYear(),
            lastWeekdayOfMonth.getMonth() + interval,
            1
          );
          break;
        }
        case 'nthWeekday': {
          const targetWeekday = eventStartDate.getDay();
          const weekNumberInMonth = Math.ceil(eventStartDate.getDate() / 7);

          const [monthFirstDay, _] = DateUtils.findFirstAndLastDay(iterationYear, iterationMonth);
          const weekdayOffset = (targetWeekday - monthFirstDay.getDay() + 7) % 7;
          const firstOccurrenceOfWeekday = DateUtils.createUTCDate(
            monthFirstDay.getFullYear(),
            monthFirstDay.getMonth(),
            monthFirstDay.getDate() + weekdayOffset
          );

          const targetDateInMonth = DateUtils.createUTCDate(
            firstOccurrenceOfWeekday.getFullYear(),
            firstOccurrenceOfWeekday.getMonth(),
            firstOccurrenceOfWeekday.getDate() + (weekNumberInMonth - 1) * 7
          );

          if (targetDateInMonth.getMonth() === firstOccurrenceOfWeekday.getMonth()) {
            addEventToList(targetDateInMonth);
            iterationDate = new Date(targetDateInMonth);
          } else {
            iterationDate = new Date(firstOccurrenceOfWeekday);
          }

          iterationDate.setMonth(iterationDate.getMonth() + interval);
          iterationDate.setDate(1);

          const nextDate = new Date(iterationDate);
          nextDate.setMonth(iterationDate.getMonth() + interval);
          nextDate.setDate(1);

          // const targetWeekday = eventStartDate.getDay();
          const targetWeekNumber = Math.ceil(eventStartDate.getDate() / 7);

          const dayOffset = (targetWeekday - nextDate.getDay() + 7) % 7;
          const firstTargetDay = new Date(nextDate);
          firstTargetDay.setDate(1 + dayOffset);

          const targetDay = new Date(firstTargetDay);
          targetDay.setDate(firstTargetDay.getDate() + (targetWeekNumber - 1) * 7);

          if (targetDay.getMonth() === nextDate.getMonth()) {
            iterationDate = targetDay;
          } else {
            iterationDate.setMonth(iterationDate.getMonth() + interval);
            iterationDate.setDate(1);
          }
          break;
        }
        default: {
          const newMonth = iterationDate.getMonth() + interval;
          const newYear = iterationDate.getFullYear() + Math.floor(newMonth / 12);
          const normalizedMonth = newMonth % 12;

          const nextDate = new Date(Date.UTC(newYear, normalizedMonth, iterationDate.getDate()));

          iterationDate = nextDate;
          break;
        }
      }
    } else if (repeatType === 'yearly' && repeatPattern) {
      const originalMonth = eventStartDate.getMonth();

      if (iterationDate.getMonth() === originalMonth) {
        switch (repeatPattern) {
          case 'exact': {
            const formattedIterationDate = DateUtils.generateFormattedDate(iterationDate);
            if (DateUtils.isValidDateFormat(formattedIterationDate)) {
              addEventToList(iterationDate);
            }

            const nextDate = new Date(iterationDate);
            const diffYear = new Date(endDate).getFullYear() - iterationDate.getFullYear();
            const nextValidDate = findNextValidDate(nextDate, diffYear, interval);

            if (!nextValidDate) {
              iterationDate = new Date(eventEndDate.getTime() + 1);
              break;
            }

            iterationDate = nextValidDate;
            break;
          }
          case 'lastDay': {
            const lastDayDate = DateUtils.createUTCDate(
              iterationDate.getFullYear(),
              originalMonth + 1,
              0
            );
            if (lastDayDate <= eventEndDate) {
              addEventToList(lastDayDate);
            }

            const nextDate = new Date(iterationDate);
            const diffYear = new Date(endDate).getFullYear() - iterationDate.getFullYear();
            const nextValidDate = findNextValidDate(nextDate, diffYear, interval);

            if (!nextValidDate) {
              iterationDate = new Date(eventEndDate.getTime() + 1);
              break;
            }

            iterationDate = nextValidDate;
            break;
          }
          case 'lastWeekday': {
            const targetWeekday = eventStartDate.getDay();
            const lastDay = DateUtils.createUTCDate(
              iterationDate.getFullYear(),
              originalMonth + 1,
              0
            );
            const dayOffset = (lastDay.getDay() - targetWeekday + 7) % 7;
            const lastWeekday = DateUtils.createUTCDate(
              lastDay.getFullYear(),
              lastDay.getMonth(),
              lastDay.getDate() - dayOffset
            );

            if (lastWeekday <= eventEndDate) {
              addEventToList(lastWeekday);
            }

            iterationDate = new Date(lastWeekday);
            iterationDate.setDate(1);

            const nextDate = new Date(iterationDate);
            const diffYear = new Date(endDate).getFullYear() - iterationDate.getFullYear();
            const nextValidDate = findNextValidDate(nextDate, diffYear, interval);

            if (!nextValidDate) {
              iterationDate = new Date(eventEndDate.getTime() + 1);
              break;
            }

            iterationDate = nextValidDate;
            break;
          }
          case 'nthWeekday': {
            const originalWeekday = eventStartDate.getDay();
            const originalWeekNumber = Math.ceil(eventStartDate.getDate() / 7);
            const currentWeekNumber = Math.ceil(iterationDate.getDate() / 7);

            if (
              iterationDate.getDay() === originalWeekday &&
              currentWeekNumber === originalWeekNumber
            ) {
              addEventToList(iterationDate);
            }

            const nextDate = new Date(iterationDate);
            nextDate.setFullYear(iterationDate.getFullYear() + interval);

            const targetMonth = eventStartDate.getMonth();
            const targetWeekday = eventStartDate.getDay();
            const targetWeekNumber = Math.ceil(eventStartDate.getDate() / 7);

            nextDate.setMonth(targetMonth);
            nextDate.setDate(1);

            const dayOffset = (targetWeekday - nextDate.getDay() + 7) % 7;
            nextDate.setDate(1 + dayOffset + (targetWeekNumber - 1) * 7);

            if (nextDate.getMonth() !== targetMonth) {
              iterationDate = new Date(eventEndDate.getTime() + 1);
              break;
            }

            iterationDate = nextDate;
            break;
          }

          default: {
            const nextDate = new Date(iterationDate);
            nextDate.setFullYear(iterationDate.getFullYear() + interval);
            iterationDate = nextDate;

            break;
          }
        }
      }
    } else {
      addEventToList(iterationDate);
    }
  }

  if (options?.endCount) {
    return generatedEvents.slice(0, options.endCount);
  }

  return generatedEvents;
};

const findNextValidDate = (currentDate: Date, years: number, interval: number): Date | null => {
  const targetYear = currentDate.getFullYear() + years;
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  for (let year = currentDate.getFullYear() + interval; year <= targetYear; year += interval) {
    const nextDate = DateUtils.createUTCDate(year, month, day);

    if (
      nextDate.getUTCFullYear() === year &&
      nextDate.getUTCMonth() === month &&
      nextDate.getUTCDate() === day
    ) {
      return nextDate;
    }
  }

  return null;
};

const createEventWithRepeat = (
  baseEvent: Event,
  date: Date,
  repeatType: RepeatType,
  interval: number,
  endDate: string
): Event => {
  return {
    ...baseEvent,
    date: DateUtils.generateFormattedDate(date),
    repeat: {
      type: repeatType,
      interval: interval,
      endDate: endDate,
    },
  };
};

const DateUtils = {
  initializeDate(dateString: string): Date {
    const date = new Date(dateString);
    return this.createUTCDate(date.getFullYear(), date.getMonth(), date.getDate());
  },

  createUTCDate(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month, day));
  },

  generateFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  isValidDateFormat(dateString: string): boolean {
    const [year, month, date] = dateString.split('-').map(Number);
    const dateToCheck = new Date(dateString);
    return (
      dateToCheck.getFullYear() === year &&
      dateToCheck.getMonth() + 1 === month &&
      dateToCheck.getDate() === date
    );
  },

  findFirstAndLastDay(year: number, month: number): [Date, Date] {
    const firstDay = this.createUTCDate(year, month, 1);
    const lastDay = this.createUTCDate(year, month + 1, 0);
    return [firstDay, lastDay];
  },

  findLastWeekday(date: Date, targetWeekday: number): Date {
    const [_, lastDay] = this.findFirstAndLastDay(date.getFullYear(), date.getMonth());
    const dayOffset = (lastDay.getDay() - targetWeekday + 7) % 7;
    return this.createUTCDate(
      lastDay.getFullYear(),
      lastDay.getMonth(),
      lastDay.getDate() - dayOffset
    );
  },
};
