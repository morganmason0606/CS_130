// Mock the useAuth hook to login to
export const mockUseAuth = (mockLogin = jest.fn(), mockUid = null) => {
    return {
      login: mockLogin,
      uid: mockUid, // CHANGE ME (optional): can set to any uid to test!
    };
  };