import { test, expect } from '@playwright/test';

test.describe('일정 관리', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const targetDate = new Date('2024-10-17T09:00:00.000Z');
      const _Date = Date;
      // @ts-expect-error - Date 클래스 오버라이드
      window.Date = class extends _Date {
        constructor() {
          super();
          return targetDate;
        }
        static now() {
          return targetDate.getTime();
        }
      };
    });
    await page.goto('/');
  });

  test('새로운 일정을 추가할 수 있다', async ({ page }) => {
    await page.getByLabel('제목').fill('임시 회의');
    await page.getByLabel('날짜').fill('2024-10-17');
    await page.getByLabel('시작 시간').clear();
    await page.getByLabel('시작 시간').fill('09:00');

    await page.getByLabel('종료 시간').clear();
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('설명').fill('임시임시 회의');
    await page.getByLabel('위치').fill('회의실 B');
    await page.getByLabel('카테고리').selectOption('기타');
    await page.getByLabel('알림 설정').selectOption('10');

    await page.getByRole('button', { name: '일정 추가' }).click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('임시 회의', { exact: true })).toBeVisible();
    await expect(eventList.getByText('임시임시 회의')).toBeVisible();
    await expect(eventList.getByText('회의실 B')).toBeVisible();
    await expect(eventList.getByText('09:00 - 15:00')).toBeVisible();
    await expect(eventList.getByText('카테고리: 기타')).toBeVisible();
  });

  test('일정을 수정할 수 있다', async ({ page }) => {
    await page.getByLabel('Edit Event').first().click();

    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('수정된 회의');
    await page.getByLabel('설명').clear();
    await page.getByLabel('설명').fill('수정된 설명');
    await page.getByRole('button', { name: '일정 수정' }).click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('수정된 회의')).toBeVisible();
    await expect(eventList.getByText('수정된 설명')).toBeVisible();
  });

  test('일정을 삭제할 수 있다', async ({ page }) => {
    await page.getByLabel('Delete Event').first().click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 회의')).not.toBeVisible();
  });
});
