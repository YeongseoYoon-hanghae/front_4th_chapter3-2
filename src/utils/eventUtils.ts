import { Event, EventFormType, RepeatPattern, RepeatType } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

const isSameFormat = (format: string): boolean => {
  const target = new Date(format);

  const [year, month, date] = format.split('-').map(Number);

  const targetYear = target.getFullYear();
  const targetMonth = target.getMonth();
  const targetDate = target.getDate();

  return targetYear === year && targetMonth + 1 === month && targetDate === date;
};

const generateFormattedDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month > 10 ? '' : '0'}${month}-${day > 10 ? '' : '0'}${day}`;
};

export const generateRepeatEvents = (
  baseEvent: Event | EventFormType,
  repeatType: RepeatType,
  interval: number,
  endDate: string,
  repeatPattern?: RepeatPattern
): (Event | EventFormType)[] => {
  const events: (Event | EventFormType)[] = [];
  const startDate = new Date(baseEvent.date);
  const repeatEndDate = new Date(endDate);
  let currentDate = new Date(startDate);

  const addEvent = (date: Date) => {
    const event = {
      ...baseEvent,
      date: date.toISOString().split('T')[0],
      repeat: {
        type: repeatType,
        interval: interval,
        endDate: endDate,
      },
    };
    events.push(event);
  };

  while (currentDate <= repeatEndDate) {
    if (repeatType === 'monthly' && repeatPattern) {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      switch (repeatPattern) {
        case 'exact': {
          const formattedCurrentDate = generateFormattedDate(currentDate);

          if (isSameFormat(formattedCurrentDate)) {
            addEvent(currentDate);
          }
          break;
        }
        case 'lastDay': {
          const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
          if (currentDate.getDate() === lastDay) {
            addEvent(currentDate);
          }

          break;
        }
        case 'lastWeekday': {
          const targetWeekday = startDate.getDay();

          const [firstDay, lastDay] = findFirstAndLastDay(currentYear, currentMonth);
          const firstTargetDay = new Date(firstDay);

          while (firstTargetDay.getDay() !== targetWeekday) {
            firstTargetDay.setDate(firstTargetDay.getDate() + 1);
          }

          const sameMonthAndDates = [];
          const checkDay = new Date(firstTargetDay);

          while (checkDay <= lastDay) {
            if (checkDay.getMonth() === currentMonth) {
              sameMonthAndDates.push(new Date(checkDay));
            }
            checkDay.setDate(checkDay.getDate() + 7);
          }

          const lastWeekday = sameMonthAndDates[sameMonthAndDates.length - 1];

          if (isLastWeekSpecificDay(lastWeekday, targetWeekday)) {
            addEvent(lastWeekday);
          }

          currentDate = new Date(lastWeekday);

          currentDate.setDate(1);
          currentDate.setMonth(currentDate.getMonth() + 1);

          break;
        }
        case 'nthWeekday': {
          const targetWeekday = startDate.getDay();
          const targetNth = Math.ceil(startDate.getDate() / 7);

          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth();

          const [firstDay, lastDay] = findFirstAndLastDay(currentYear, currentMonth);
          let firstTargetDay = new Date(firstDay);

          while (firstTargetDay.getDay() !== targetWeekday) {
            firstTargetDay.setDate(firstTargetDay.getDate() + 1);
          }

          const targetDayCount =
            Math.floor((lastDay.getDate() - firstTargetDay.getDate() + 1) / 7) + 1;

          const sameMonthAndDates = [];

          for (let i = 1; i < targetDayCount + 1; i++) {
            const nthTargetDay = new Date(firstTargetDay);

            sameMonthAndDates.push(firstTargetDay);

            nthTargetDay.setDate(nthTargetDay.getDate() + 7);

            if (nthTargetDay.getMonth() !== firstTargetDay.getMonth()) {
              break;
            }

            firstTargetDay = new Date(nthTargetDay);
          }

          const targetDay = sameMonthAndDates[targetNth - 1];

          if (targetDay) {
            addEvent(targetDay);
            currentDate = new Date(targetDay);
          } else {
            currentDate = new Date(firstTargetDay);
          }

          currentDate.setMonth(currentDate.getMonth() + 1);
          currentDate.setDate(1);
          break;
        }
      }
    } else if (repeatType === 'yearly' && repeatPattern) {
      const targetMonth = startDate.getMonth();

      if (currentDate.getMonth() === targetMonth) {
        switch (repeatPattern) {
          case 'exact': {
            const formattedCurrentDate = generateFormattedDate(currentDate);
            if (isSameFormat(formattedCurrentDate)) {
              addEvent(currentDate);
            }
            break;
          }
          case 'nthWeekday': {
            const targetWeekday = startDate.getDay();
            const targetWeekNumber = Math.ceil(startDate.getDate() / 7);

            const currentWeekNumber = Math.ceil(currentDate.getDate() / 7);

            if (currentDate.getDay() === targetWeekday && currentWeekNumber === targetWeekNumber) {
              addEvent(currentDate);
            }
            break;
          }
          case 'lastDay': {
            const lastDay = new Date(currentDate.getFullYear(), targetMonth + 1, 0).getDate();
            if (currentDate.getDate() === lastDay) {
              addEvent(currentDate);
            }
            break;
          }
          case 'lastWeekday': {
            const targetWeekday = startDate.getDay();
            const lastDay = new Date(currentDate.getFullYear(), targetMonth + 1, 0);
            const lastWeekday = new Date(lastDay);
            while (lastWeekday.getDay() !== targetWeekday) {
              lastWeekday.setDate(lastWeekday.getDate() - 1);
            }
            if (currentDate.getTime() === lastWeekday.getTime()) {
              addEvent(currentDate);
            }
            break;
          }
        }
      }
    } else {
      addEvent(currentDate);
    }

    switch (repeatType) {
      case 'daily':
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + interval));
        break;
      case 'weekly':
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7 * interval));
        break;
      case 'monthly': {
        if (repeatPattern === 'nthWeekday') {
          break;
        } else {
          const newMonth = currentDate.getMonth() + interval;
          const newYear = currentDate.getFullYear() + Math.floor(newMonth / 12);
          const normalizedMonth = newMonth % 12;

          let nextDate;

          switch (repeatPattern) {
            case 'lastDay':
              nextDate = new Date(Date.UTC(newYear, normalizedMonth + 1, 0));

              currentDate = nextDate;
              break;

            case 'exact': {
              const targetDate = startDate.getDate();
              const lastDayOfMonth = new Date(Date.UTC(newYear, normalizedMonth + 1, 0)).getDate();

              nextDate = new Date(Date.UTC(newYear, normalizedMonth, targetDate));

              if (lastDayOfMonth >= targetDate && nextDate <= repeatEndDate) {
                addEvent(nextDate);
              }

              currentDate = new Date(Date.UTC(newYear, normalizedMonth + 1, targetDate));
              break;
            }
            case 'lastWeekday':
              //    nextDate = new Date(Date.UTC(newYear, normalizedMonth, currentDate.getDate()));
              break;

            default: {
              nextDate = new Date(Date.UTC(newYear, normalizedMonth, currentDate.getDate()));

              currentDate = nextDate;
            }
          }
        }
        break;
      }
      case 'yearly': {
        if (repeatPattern === 'nthWeekday') {
          const nextDate = new Date(currentDate);
          nextDate.setFullYear(currentDate.getFullYear() + interval);

          const targetMonth = startDate.getMonth();
          const targetWeekday = startDate.getDay();
          const targetWeekNumber = Math.ceil(startDate.getDate() / 7);

          nextDate.setMonth(targetMonth);

          nextDate.setDate(1);

          while (nextDate.getDay() !== targetWeekday) {
            nextDate.setDate(nextDate.getDate() + 1);
          }

          nextDate.setDate(nextDate.getDate() + 7 * (targetWeekNumber - 1));

          if (nextDate.getMonth() !== targetMonth) {
            currentDate = new Date(repeatEndDate.getTime() + 1);
            break;
          }

          currentDate = nextDate;
        } else {
          const diffYear = new Date(endDate).getFullYear() - currentDate.getFullYear();
          const nextDate = new Date(currentDate);
          const nextValidDate = findNextValidDate(nextDate, diffYear);

          if (!nextValidDate) {
            currentDate = new Date(repeatEndDate.getTime() + 1);
            break;
          }

          currentDate = nextValidDate;
        }
        break;
      }
      default:
        return events;
    }
  }

  return events;
};

function findNextValidDate(currentDate: Date, years: number): Date | null {
  const targetYear = currentDate.getFullYear() + years;
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  for (let year = currentDate.getFullYear() + 1; year <= targetYear; year++) {
    const nextDate = new Date(Date.UTC(year, month, day));

    if (
      nextDate.getUTCFullYear() === year &&
      nextDate.getUTCMonth() === month &&
      nextDate.getUTCDate() === day
    ) {
      return nextDate;
    }
  }

  return null;
}

const findFirstAndLastDay = (year: number, month: number) => {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  return [firstDay, lastDay];
};

function getWeeksInMonth(year: number, month: number): number {
  // 해당 월의 첫째 날과 마지막 날을 구합니다
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));

  // 첫째 주의 시작일 (일요일)을 구합니다
  const firstWeekStart = new Date(firstDay);
  while (firstWeekStart.getDay() !== 0) {
    firstWeekStart.setDate(firstWeekStart.getDate() - 1);
  }

  // 마지막 주의 마지막 날 (토요일)을 구합니다
  const lastWeekEnd = new Date(lastDay);
  while (lastWeekEnd.getDay() !== 6) {
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 1);
  }

  // 전체 주 수를 계산합니다
  const totalDays = (lastWeekEnd.getTime() - firstWeekStart.getTime()) / (1000 * 60 * 60 * 24);
  return Math.ceil((totalDays + 1) / 7);
}

function isLastWeekSpecificDay(date: Date, targetDayOfWeek: number): boolean {
  // 1. 해당 월의 마지막 날짜 구하기
  const lastDay = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));

  // 2. 마지막 날짜가 있는 주의 시작일 구하기 (일요일 기준)
  const lastWeekStart = new Date(lastDay);
  lastWeekStart.setDate(lastDay.getDate() - lastDay.getDay());

  // 3. 마지막 주의 특정 요일 구하기
  const lastWeekTargetDay = new Date(lastWeekStart);
  lastWeekTargetDay.setDate(lastWeekStart.getDate() + targetDayOfWeek);

  // 4. 마지막 주의 해당 요일이 같은 달에 있는지 확인
  if (lastWeekTargetDay.getMonth() !== date.getMonth()) {
    return false; // 마지막 주에 해당 요일이 없는 경우
  }

  // 5. 입력받은 날짜가 마지막 주의 해당 요일과 같은지 확인
  return date.getTime() === lastWeekTargetDay.getTime();
}
