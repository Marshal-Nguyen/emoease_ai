import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Home from "./pages/User/Web/Home";
import Intro from "./pages/User/Web/Intro";
import { ToastContainer, Zoom, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import NavigaForWeb from "./components/NavigaForWeb";

import { Outlet } from "react-router-dom";
// manager
import TestButton from "../src/components/manager/TestButton";
import Manager1 from "../src/components/manager/sildebarLeft/SildebarLeft";
import Manager from "./pages/manager/manager";
import DashboardManager from "./pages/manager/dashboard/Dashboard";
import AddCustomerManager from "./pages/manager/customer/AddCustomer";
import ListCustomerManager from "./pages/manager/customer/ListCustomer";
import AddStaff from "./pages/manager/staff/AddStaff";
import ListStaff from "./pages/manager/staff/ListStaff";
import AcceptDoctor from "./pages/manager/doctor/AcceptDoctor";
import ListDoctor from "./pages/manager/doctor/ListDoctor";
import AddPromo from "./pages/manager/promotion/AddPromo";
import ListPromo from "./pages/manager/promotion/ListPromo";
import ListFeedback from "./pages/manager/feedback/ListFeedback";
import ResponseFeedback from "./pages/manager/feedback/ResponseFeedback";
import DashboardForUser from "./components/Dashboard/DashboardForUser";
import LearnAboutEmo from "./pages/User/Web/LearnAboutEmo";
import Counselor from "./pages/User/Web/Counselor";
import Service from "./pages/User/Web/Service";
import Blog from "./pages/User/Web/Blog";
import TestEmotion from "./pages/User/Web/TestEmotion";
function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Các route chính */}
          <Route path="/Intro" element={<Intro />} />
          <Route path="/" element={<Home />}>
            <Route index element={<Navigate to="learnAboutEmo" replace />} />
            <Route path="dashboardUser" element={<DashboardForUser />} />
            <Route path="learnAboutEmo" element={<LearnAboutEmo />} />
            <Route path="counselor" element={<Counselor />} />
            <Route path="service" element={<Service />} />
            <Route path="blog" element={<Blog />} />
            <Route path="testEmotion" element={<TestEmotion />} />
          </Route>

          {/* Route Manager */}
          {/* <Route path="/Manager" element={<Manager />}>
            <Route path="/Manager" element={<DashboardManager />} />

            <Route path="Button" element={<TestButton />} />
            <Route path="dashboard" element={<DashboardManager />} />

            <Route path="customer" element={<AddCustomerManager />} />
            <Route path="addCustomer" element={<AddCustomerManager />} />
            <Route path="viewCustomer" element={<ListCustomerManager />} />
            <Route path="staff" element={<AddStaff />} />
            <Route path="addStaff" element={<AddStaff />} />
            <Route path="viewStaff" element={<ListStaff />} />
            <Route path="doctor" element={<AcceptDoctor />} />
            <Route path="addDoctor" element={<AcceptDoctor />} />
            <Route path="viewDoctor" element={<ListDoctor />} />
            <Route path="promotion" element={<AddPromo />} />
            <Route path="addPromo" element={<AddPromo />} />
            <Route path="managePromo" element={<ListPromo />} />
            <Route path="feedback" element={<ListFeedback />} />
            <Route path="view-feedback" element={<ListFeedback />} />
            <Route path="respond-feedback" element={<ResponseFeedback />} />
          </Route> */}

          {/* Các route khác */}
          {/* <Route path="/Manager1" element={<Manager1 />} /> */}
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
