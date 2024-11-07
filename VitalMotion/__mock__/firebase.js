// __mocks__/firebase.js
export const firebaseapp = jest.fn().mockReturnValue({
    currentUser: { uid: '123', email: 'test@example.com' },
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve(true)),
    signOut: jest.fn(() => Promise.resolve(true)),
  });
  