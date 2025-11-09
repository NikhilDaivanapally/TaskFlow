import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from "./pages/Home.page";
import { Suspense } from "react";
import AuthLayout from "./components/layouts/AuthLayout";
import Signin from "./pages/auth/Signin.page";
import Signup from "./pages/auth/Signup.page";
import { Toaster } from "sonner";

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen text-lg font-medium">
    Loading...
  </div>
);

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <HomePage />
        </Suspense>
      ),
    },
    {
      element: <AuthLayout />,
      children: [
        {
          path: "/signin",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Signin />
            </Suspense>
          ),
        },
        {
          path: "/signup",
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Signup />
            </Suspense>
          ),
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </>
  );
}

export default App;
