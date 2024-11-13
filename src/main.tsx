import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthCallback from "./AuthCallback";
import AuthenticatedRoute from "./AuthenticatedRoute";
import { App } from "./app/App";
import Login from "./Login";
import "./index.scss";
import { Provider } from "react-redux";
import { store } from "./store/store";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AuthenticatedRoute />,
      children: [
        {
          path: "/",
          element: <Provider store={store}><App /></Provider>,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      // This is the route defined in your application's redirect URL
      path: "/auth/callback",
      element: <AuthCallback />,
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
