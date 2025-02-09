import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Notifications } from '../../components/Notifications';
import { renderWithSetup } from '../test-utils';

describe('Notifications', () => {
  const mockNotifications = [
    { id: '1', message: '첫 번째 알림' },
    { id: '2', message: '두 번째 알림' },
  ];

  const defaultProps = {
    notifications: mockNotifications,
    setNotifications: vi.fn(),
  };

  it('알림 목록을 렌더링한다', () => {
    renderWithSetup(<Notifications {...defaultProps} />);

    expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
    expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
  });

  it('알림이 없을 때는 아무것도 렌더링하지 않는다', () => {
    renderWithSetup(
      <Notifications notifications={[]} setNotifications={defaultProps.setNotifications} />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('닫기 버튼을 클릭하면 해당 알림이 제거된다', async () => {
    const user = userEvent.setup();
    renderWithSetup(<Notifications {...defaultProps} />);

    const closeButtons = screen.getAllByRole('button');
    await user.click(closeButtons[0]);

    expect(defaultProps.setNotifications).toHaveBeenCalledTimes(1);
    const filterCallback = defaultProps.setNotifications.mock.calls[0][0];
    const result = filterCallback(mockNotifications);
    expect(result).toEqual([{ id: '2', message: '두 번째 알림' }]);
  });
});
