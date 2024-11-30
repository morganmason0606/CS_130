import React from "react"
import { render, act, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/login';
import { useAuth } from '../app/auth_context';
import { mockUseAuth } from './utils';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from "expo-router";

// Mock Firebase
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({ /* Mocked auth object */ })),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
}));

// Manually mock the `useAuth` hook
jest.mock('../app/auth_context', () => ({
    useAuth: jest.fn(),  // Mock useAuth explicitly
}));

// Mock router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

describe("Login Screen - UI rendering", () => {
    let mockLogin;
    beforeEach(() => {
        // Reset all mocks and create a new mock function for login
        jest.clearAllMocks();
        mockLogin = jest.fn(); // Mock login function
        useAuth.mockReturnValue(mockUseAuth(mockLogin)); // Mock useAuth hook to return mock values
    });

    test("Input boxes correctly renders on Login page", () => {
        const {getByTestId} = render(<LoginScreen />);

        expect(getByTestId("email")).toBeTruthy();
        expect(getByTestId("password")).toBeTruthy();

    });

    test("First name and last name inputs render when in Registration mode", () => {
        const { getByTestId } = render(<LoginScreen />);

        // Switch to sign-up mode
        const signUpButton = getByTestId("signUpToggle");

        act(() => {
            signUpButton.props.onClick();
        });

        expect(getByTestId("firstName")).toBeTruthy();
        expect(getByTestId("lastName")).toBeTruthy();
    });
});

describe("Login Screen - Form Validation", () => {
    test("Submit button disabled when fields are empty", () => {
        const { getByTestId } = render(<LoginScreen />);
        
        const loginSubmitButton = getByTestId("loginSubmitButton");
        expect(loginSubmitButton.props.pointerEvents).toBe('none');
    });
    
    test("Error message shown when fields are empty on submit", () => {
        const { getByTestId, getByText } = render(<LoginScreen />);
        
        const loginSubmitButton = getByTestId("loginSubmitButton");
        loginSubmitButton.props.onPress();
        
        expect(getByText("Please fill in all fields.")).toBeTruthy();
    });
});

describe("Login Screen - Authentication & Redirection", () => {
    test("Register button triggers sign-up function", async () => {
        createUserWithEmailAndPassword.mockResolvedValueOnce({
            user: {
                getIdToken: jest.fn().mockResolvedValueOnce("dummy-token"),
            },
        });
    
        const { getByTestId } = render(<LoginScreen />);
    
        // Switch to Sign-Up mode
        const signUpToggleButton = getByTestId("signUpToggle");
        act(() => {
            signUpToggleButton.props.onClick();
        });
        
        const firstNameInput = getByTestId("firstName");
        const lastNameInput = getByTestId("lastName");
        const emailInput = getByTestId("email");
        const passwordInput = getByTestId("password");
    
        // Mock entering the sign-up details
        firstNameInput.props.onChangeText("John");
        lastNameInput.props.onChangeText("Doe");
        emailInput.props.onChangeText("test@example.com");
        passwordInput.props.onChangeText("password123");
        
        const signUpButton = getByTestId("registerSubmitButton");
        act(() => {
            signUpButton.props.onPress();
        });
    
        // Ensure the Firebase sign-up method was called
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.any(Object), // The auth object
          "test@example.com",
          "password123"
        );
    });

    test("Successful login redirects to Workouts page", async () => {
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
        emailInput.props.onChangeText("test@example.com");
        passwordInput.props.onChangeText("password123");
    
        const loginButton = getByTestId("loginSubmitButton");
        await act(async () => {
            loginButton.props.onPress();  // Call the onPress handler
        });
    
        // Wait for the router to push
        //await Promise.resolve();
        await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/workout"));
      });
});