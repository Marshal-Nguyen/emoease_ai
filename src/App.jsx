import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "animate.css";
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init({
  duration: 1000, // Thời gian animation (ms)
  easing: "ease-in-out", // Hiệu ứng chuyển động
  once: false, // Chạy một lần khi cuộn
});

import Home from "./pages/User/Web/HomeUser";
// import Intro from "./pages/User/Web/Intro";
import { ToastContainer, Zoom, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Booking from "./pages/User/Web/Booking";
import Shop from "./pages/User/Web/Shop";
import Workshop from "./pages/User/Web/Workshop";
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
import CustomerDetail from "./components/manager/customer/CustomerDetail";
import DoctorDetail from "./components/manager/doctor/DoctorDetail";
import AcceptDoctor from "./pages/manager/doctor/AcceptDoctor";
import ListDoctor from "./pages/manager/doctor/ListDoctor";
import EditDoctor from "./pages/manager/doctor/EditDoctor";
import AddPackages from "./pages/manager/services/AddService";
import ListPackages from "./pages/manager/services/ListService";
import ListPendingReplies from "./pages/manager/pending_replies/ListPendingReplies";
import ProfileManager from "./pages/manager/profile/Profile";
import HistoryPatient1 from "./components/manager/customer/HistoryPatient";
import BookingList from "./pages/manager/booking/Booking";
import BookingDetail from "./pages/manager/booking/BookingDetail";
import Transactions from "./pages/manager/transaction/Transactions";
//staff
import Staff from "./pages/staff/Staff";
import Chatbox from "./components/staff/Chatbox";
import HomeStaff from "./pages/staff/home/HomeStaff";
import ListCustomerStaff from "./pages/staff/listCustomer/ListCustomer";
import MessengerUI from "./pages/staff/messager/Message";
import DashboardStaff from "./pages/staff/dashboard/Dashboard";
import Regist from "./components/Web/Regist";
import ListDoctorStaff from "./pages/staff/doctor/ListOfDoctor";
import StaffProfile from "./pages/staff/profile/StaffProfile";
import BlogStaff from "../src/pages/staff/blog/Blog";
//user

import LearnAboutEmo from "./pages/User/Web/LearnAboutEmo";
import Counselor from "./pages/User/Web/Counselor";
import Service from "./pages/User/Web/Service";
import Blog from "./pages/User/Web/Blog";
import TestEmotion from "./pages/User/Web/TestEmotion";
import AddProductPage from "./components/manager/store/AddProductPage";
import DashboardPartient from "./pages/User/Dashboard/DashboardPartient";
import StatictisPatient from "./pages/User/Dashboard/StatictisPatient";
import RoadMapPatient from "./pages/User/Dashboard/RoadMapPatient";
import ProfilePatient from "./pages/User/Dashboard/ProfilePatient";
import HistoryPatient from "./pages/User/Dashboard/HistoryPatient";
import WeeklyPlanner from "./components/Dashboard/Patient/WeeklyPlanner";
import DashboarDoctor from "./pages/doctor/Dashboard/DashboarDoctor";
import StatictisDoctor from "./pages/doctor/Dashboard/StatictisDoctor";
import ProfileDoctor from "./pages/doctor/Dashboard/ProfileDoctor";
import RoadMapCreate from "./pages/doctor/Dashboard/RoadMapCreate";
import TestQuestionList from "./pages/Test/TestQuestionList";
import PrivateRoute from "./components/Web/PrivateRoute";

import PaymentSuccess from "./components/Payment/PaymentSuccess";
import PaymentFailure from "./components/Payment/PaymentFailure";
import PaymentCallback from "./components/Payment/PaymentCallback";
import Chat from "./components/Chatbox/Chat";
import PatientBooking from "./pages/doctor/Dashboard/PatientBooking";
import Shopping from "./pages/User/Dashboard/Shopping";
import OAuthCallback from "./components/oauth/callback";
import VerifyDoctorEmail from "./components/oauth/verifiEmail";
import { DataProvider } from "./components/IntroComponents/DataContext";
import Intro from "./pages/User/Web/Intro";
import AIChatBoxWithEmo from "./pages/User/Web/AIChatBoxWithEmo";
function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Các route chính */}
          <Route
            path="/daily-habits"
            element={
              <DataProvider>
                <Intro />
              </DataProvider>
            }
          />
          <Route path="/" element={<Navigate to="/EMO" />} />
          <Route path="regist" element={<Regist />} />
          <Route path="/verify-email" element={<VerifyDoctorEmail />} />
          <Route path="/EMO" element={<Home />}>
            <Route index element={<Navigate to="learnAboutEmo" replace />} />
            <Route path="learnAboutEmo" element={<LearnAboutEmo />} />
            <Route path="counselor" element={<Counselor />} />
            <Route path="booking/:doctorId" element={<Booking />} />
            <Route path="service" element={<Service />} />
            <Route path="blog" element={<BlogStaff />} />
            <Route path="shop" element={<Shop />} />
            <Route path="workshop" element={<Workshop />} />
            <Route path="testEmotion" element={<TestEmotion />} />
            <Route path="TestQuestionList" element={<TestQuestionList />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="payment-failure" element={<PaymentFailure />} />
            <Route path="addProduct" element={<AddProductPage />} />
          </Route>
          <Route path="/AIChatBoxWithEmo" element={<AIChatBoxWithEmo />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/payments/callback" element={<PaymentCallback />} />
          <Route element={<PrivateRoute allowedRoles={["User"]} />}>
            <Route path="/DashboardPartient" element={<DashboardPartient />}>
              <Route index element={<Navigate to="StatictisPatient" />} />
              <Route path="StatictisPatient" element={<StatictisPatient />} />
              <Route path="Roadmap" element={<RoadMapPatient />} />
              <Route path="ProfilePatient" element={<ProfilePatient />} />
              <Route path="HistoryPatient" element={<HistoryPatient />} />
              <Route path="Chat" element={<Chat />} />
              <Route path="Shopping" element={<Shopping />} />
            </Route>
          </Route>
          <Route element={<PrivateRoute allowedRoles={["Doctor"]} />}>
            <Route path="/DashboardDoctor" element={<DashboarDoctor />}>
              <Route index element={<Navigate to="StatictisDoctor" />} />
              <Route path="StatictisDoctor" element={<StatictisDoctor />} />
              <Route path="RoadmapCreate" element={<RoadMapCreate />} />
              <Route path="ProfileDoctor" element={<ProfileDoctor />} />
              <Route path="Chat" element={<Chat />} />
              <Route path="PatientBooking" element={<PatientBooking />} />
            </Route>
          </Route>
          {/* Route Manager */}
          <Route path="/Manager" element={<Manager />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="Button" element={<TestButton />} />
            <Route path="dashboard" element={<DashboardManager />} />

            {/* <Route path="customer" element={<AddCustomerManager />} /> */}
            <Route path="addCustomer" element={<AddCustomerManager />} />
            <Route path="viewCustomer" element={<ListCustomerManager />} />
            <Route path="viewCustomer/:id" element={<CustomerDetail />} />
            <Route path="booking" element={<BookingList />} />
            <Route path="booking/:id" element={<BookingDetail />} />
            <Route path="transaction" element={<Transactions />} />
            <Route path="transaction/:id" element={<Transactions />} />

            <Route path="addStaff" element={<AddStaff />} />
            <Route path="viewStaff" element={<ListStaff />} />
            {/* <Route path="doctor" element={<AcceptDoctor />} /> */}
            <Route path="addDoctor" element={<AcceptDoctor />} />
            <Route path="viewDoctor" element={<ListDoctor />} />
            <Route path="ProfileDoctor/:userId" element={<EditDoctor />} />
            <Route path="viewDoctor/:userId" element={<DoctorDetail />} />

            {/* <Route path="promotion" element={<AddPackages />} /> */}
            <Route path="addPackages" element={<AddPackages />} />
            <Route path="managePackages" element={<ListPackages />} />
            {/* <Route path="feedback" element={<ListPendingReplies />} /> */}
            <Route path="view-message" element={<ListPendingReplies />} />
          </Route>

          <Route path="/manager/profile" element={<ProfileManager />} />
          {/* Route Staff */}
          <Route element={<PrivateRoute allowedRoles={["Staff"]} />}>
            <Route path="/staff" element={<Staff />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="chat" element={<Chatbox />} />
              <Route path="regit" element={<Regist />} />
              <Route path="customer" element={<ListCustomerStaff />} />
              <Route path="doctor" element={<Counselor />} />
              <Route path="message" element={<MessengerUI />} />
              <Route path="profile" element={<StaffProfile />} />
              <Route path="blog" element={<BlogStaff />} />
              {/* <Route path="home" element={<LearnAboutEmo />} /> */}
              <Route path="home" element={<HomeStaff />} />
              <Route path="dashboard" element={<DashboardStaff />} />
            </Route>
          </Route>
          {/* Các route khác */}
        </Routes>
      </Router>

      <ToastContainer />
    </>
  );
}

export default App;
