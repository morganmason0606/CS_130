import React from "react"
import { render } from '@testing-library/react-native';
import LoginScreen from '../app/login';


describe("Login Screen", ()=>{
    test("test correctly renders", ()=>{
        const {getByPlaceholderText} = render(<LoginScreen/>);

        const email = getByTestId("email");
        expect(email).toBeTruthy();
        const password = getByTestId("password");
        expect(password).toBeTruthy();

    });
});