import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../login';
import { useAuth } from '../../../contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock useAuth and useNavigate
jest.mock('../../../contexts/AuthContext');
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('Login Component', () => {
  const loginMock = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ login: loginMock });
    loginMock.mockReset();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

  it('renders email and password input fields', () => {
    renderComponent();

    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  it('updates input values when typed into', () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' },
    });

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('password123')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderComponent();

    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const toggleButton = screen.getByRole('showpassword-button', { hidden: true }); // Icon button

    // Initially type='password'
    expect(passwordInput.type).toBe('password');

    // Click to show
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Click again to hide
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('displays loading indicator when submitting form', async () => {
    loginMock.mockResolvedValue({ success: true });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));
    
    expect(await screen.findByText(/Signing in.../i)).toBeInTheDocument();
  });

  it('calls login and navigates on success', async () => {
    loginMock.mockResolvedValue({ success: true });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('does not navigate on login failure', async () => {
    loginMock.mockResolvedValue({ success: false });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalled();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});
