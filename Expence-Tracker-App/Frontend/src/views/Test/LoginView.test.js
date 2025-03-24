import React from 'react';
import { render } from '@testing-library/react-native';
import LoginView from '../auth/LoginView';



test('renders Login button', () => {
  const { getByText } = render(<LoginView />);
  const button = getByText('Login');
  expect(button).toBeTruthy();
});
