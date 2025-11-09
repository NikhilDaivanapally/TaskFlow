import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <main className="w-full h-screen">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
