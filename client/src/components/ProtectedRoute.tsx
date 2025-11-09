import { Navigate, Outlet } from "react-router";
import { useGetProfileQuery } from "../store/api/userApi";
import { useEffect } from "react";
import { useAppDispatch } from "../hooks/useReducer";
import { setUser } from "../store/slices/authSlice";

const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  // Get Authenticated User
  const { isLoading, data, isError } = useGetProfileQuery({});

  useEffect(() => {
    if (data) {
      console.log(data);
      dispatch(setUser(data?.user));
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <Navigate to="/signin" replace />;
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default ProtectedRoute;
