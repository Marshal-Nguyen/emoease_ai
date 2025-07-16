import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleRedirect = () => {
  const { userRole, token } = useSelector((state) => state.auth);

  // If not authenticated, redirect to home
  if (!token) {
    return <Navigate to="/EMO/learnAboutEmo" replace />;
  }

  // Redirect based on user role
  switch (userRole) {
    case "Manager":
      return <Navigate to="/Manager/dashboard" replace />;
    case "Doctor":
      return <Navigate to="/DashboardDoctor/StatictisDoctor" replace />;
    case "User":
      return <Navigate to="/DashboardPartient/StatictisPatient" replace />;
    // case "Staff":
    //   return <Navigate to="/staff/home" replace />;
    default:
      return <Navigate to="/EMO/learnAboutEmo" replace />;
  }
};

export default RoleRedirect;
