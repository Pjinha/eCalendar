import React from 'react';
import * as serviceWorker from './serviceWorker';
import ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import App from './routes/App';
import Login from "./routes/Login";
import {CookiesProvider} from "react-cookie";

/*
* This is the main entry point of the application.
* It is responsible for rendering the application.
* */

const router = createBrowserRouter([
    // route for the login page
    {
        path: "/",
        element: <Login/>,
    },
    // route for the main page
    {
        path: "/dashboard",
        element: <App/>,
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <CookiesProvider> {/* Needs to work with cookies */}
            <RouterProvider router={router}/> {/* Need to work route */}
        </CookiesProvider>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
