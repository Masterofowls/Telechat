import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../components/theme-provider';

function render(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return {
    user: userEvent.setup(),
    ...rtlRender(ui, {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter>{children}</BrowserRouter>
        </ThemeProvider>
      ),
    }),
  };
}

export * from '@testing-library/react';
export { render, screen };
