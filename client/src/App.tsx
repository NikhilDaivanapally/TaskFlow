import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from "./pages/Home.page";
import { Suspense } from "react";
import AuthLayout from "./components/layouts/AuthLayout";
import Signin from "./pages/auth/Signin.page";
import Signup from "./pages/auth/Signup.page";
import { Toaster } from "sonner";
import DashboardLayout from "./components/layouts/DashboardLayout";
import DashboardSkeleton from "./components/loaders/DashboardSkeleton";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import TasksSkeleton from "./components/loaders/TaskTableSkeleton";
import Tasks from "./pages/dashboard/Tasks";
import Profile from "./pages/dashboard/Profile";

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
    {
      path: "/dashboard",
      element: <ProtectedRoute />,
      children: [
        {
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<DashboardSkeleton />}>
                  <Dashboard />
                </Suspense>
              ),
            },
            {
              path: "tasks",
              element: (
                <Suspense fallback={<TasksSkeleton />}>
                  <Tasks />
                </Suspense>
              ),
            },
            {
              path: "profile",
              element: (
                <Suspense fallback={<LoadingFallback />}>
                  <Profile />
                </Suspense>
              ),
            },
          ],
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
