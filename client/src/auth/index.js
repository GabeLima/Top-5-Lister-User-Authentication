import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import api from '../api'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    REGISTER_USER: "REGISTER_USER",
    LOGIN_USER: "LOGIN_USER"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                console.log("Inside GET_LOGGED_IN reducer, loggedIn: ", payload.loggedIn);
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                });
            }
            case AuthActionType.REGISTER_USER: {
                console.log("Inside REGISTER_USER reducer, loggedIn: ", true);
                return setAuth({
                    user: payload.user,
                    loggedIn: true
                })
            }
            case AuthActionType.LOGIN_USER: {
                console.log("Inside LOGIN_USER reducer, loggedIn: ", payload.loggedIn);
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn //Assuming that if the login user reducer is called, we're loggedIn
                })
            }
            default:
                return auth;
        }
    }

    auth.logoutUser = async function () {
        const response = await api.logoutUser();
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: response.data.loggedIn,
                    user: response.data.user
                }
            });
        }
    }


    auth.getLoggedIn = async function () {
        const response = await api.getLoggedIn();
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: response.data.loggedIn,
                    user: response.data.user
                }
            });
        }
    }

    auth.registerUser = async function(userData, store) {
        const response = await api.registerUser(userData);      
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: response.data.user
                }
            })
            history.push("/");
            store.loadIdNamePairs();
        }
    }

    auth.loginUser = async function(userData, store) {
        console.log("Inside auth.loginUser with userData: ", userData);
        try{
            const response = await api.loginUser(userData);
            console.log("Users gotten from the database: ", response);
            if (response.status === 200) {
                console.log("Login status (from loginUser reducer: ", response.data.loggedIn);
                console.log("User data: ", response.data.user);
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        loggedIn: true,
                        user: response.data.user
                    }
                })
                history.push("/");
                store.loadIdNamePairs();
            }
        }catch (Exception){
            console.log(Exception);
            console.log("Exception caught while calling the api.loginUser");
        }
    }

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };