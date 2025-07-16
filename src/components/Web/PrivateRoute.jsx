import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles }) => {
  const { token, userRole } = useSelector((state) => state.auth);

  console.log("PrivateRoute - User Role:", userRole);

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/EMO/learnAboutEmo" replace />;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
