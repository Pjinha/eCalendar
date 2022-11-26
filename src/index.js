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
import store from "./store";
import {Provider} from "react-redux";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login/>,
    },
    {
        path: "/dashboard",
        element: <App/>,
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <CookiesProvider>
                <RouterProvider router={router}/>
            </CookiesProvider>
        </Provider>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
