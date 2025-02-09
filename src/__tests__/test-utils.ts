import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

interface RenderWithSetupResult extends RenderResult {
  user: UserEvent;
}

export const renderWithSetup = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderWithSetupResult => {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ChakraProvider,
      ...options,
    }),
  };
};
