import React from "react"
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../app/login';
import Navbar from '../app/navbar'
import Workout from '../app/workout';
import { useAuth } from '../app/auth_context';
import { mockUseAuth } from './utils';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from "expo-router";

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ /* Mocked auth object */ })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    return jest.fn();  // mock unsubscribe function
  }),
  signOut: jest.fn(),
}));

// Manually mock the 'useAuth' hook
jest.mock('../app/auth_context', () => ({
  useAuth: jest.fn(),
}));

// Mock router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  Link: jest.fn().mockImplementation(({ children }) => <>{children}</>),
}));

describe("Workout tests", () => {
  let mockLogin;
  beforeEach( async () => {
    // Reset all mocks and create a new mock function for login
    jest.clearAllMocks();
    mockLogin = jest.fn(); // Mock login function
    useAuth.mockReturnValue(mockUseAuth(mockLogin)); // Mock useAuth hook to return mock values

    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
          getIdToken: jest.fn().mockResolvedValueOnce("dummy-token"),
      }
    });

    // Mock successful response from the /verify-token endpoint
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ uid: "dummy-uid" }),
    });

    const { getByTestId } = render(<LoginScreen />);
    
    const emailInput = getByTestId("email");
    const passwordInput = getByTestId("password");

    // Mock entering login details

    act(() => {
      emailInput.props.onChangeText("test@example.com");
      passwordInput.props.onChangeText("password123");
    });

    const loginButton = getByTestId("loginSubmitButton");
    await act(async () => {
      loginButton.props.onPress();
    });

    // Wait for the router to push
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/workout"));
  });

  test("Navbar is rendered", async () => {
    const { getByTestId } = render(<Navbar />);

    await waitFor(() => expect(getByTestId("navlinks")).toBeTruthy());
  });

  test("Workout page is rendered", async () => {
    const { getByText } = render(<Workout />);

    await waitFor(() => expect(getByText("Your Workouts")).toBeTruthy());
  });

  test("Create new workout dropdown menu is rendered", async () => {
    const { getByTestId } = render(<Workout />);

    // Simulate click on "+ New Workout" button
    const newWorkoutButton = getByTestId("newWorkoutButton");
    
    fireEvent.press(newWorkoutButton);
  });

  // Only can be run if there's workouts:
  // test("Workout can be deleted successfully", async () => {
  
  //   const { getByText, getByTestId, getAllByTestId } = render(<Workout />);
  
  //   // Wait for the 3 default workouts to be rendered
  //   const workoutTitles = await waitFor(() => getAllByTestId('workoutName'));
  //   expect(workoutTitles.length).toBeGreaterThan(0); // CHANGE TO 3
  
  //   // Simulate click on delete button
  //   const deleteButton = getByTestId("deleteButton");
  //   await act(async () => {
  //     deleteButton.props.onPress();
  //   });
  
  //   // Ensure that fetchWorkouts is called again after deletion
  //   expect(global.fetch).toHaveBeenCalledTimes(2*3); // call fetches and deletes per deletion
  
  //   // Verify that the workout list is now empty
  //   expect(getByText("No workouts found.")).toBeTruthy();
  // });

  // Cleanup after all tests
  afterAll(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
    if (global.fetch) {
      global.fetch.mockRestore();
    }
    if (global.onAuthStateChanged) {
      global.onAuthStateChanged.mockRestore();
    }
  });
});