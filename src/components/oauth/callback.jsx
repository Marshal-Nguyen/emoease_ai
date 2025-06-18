import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../Supabase/supabaseClient";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/authSlice";
const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTokenAndCallBE = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          console.error("Supabase session error:", error);
          toast.error("Đăng nhập thất bại!");
          navigate("/EMO/learnAboutEmo");
          return;
        }

        const access_token = data.session.access_token;

        try {
          const res = await axios.post(
            "http://localhost:3000/api/auth/google/callback",
            { access_token },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const { token, role, profileId, user_id } = res.data;
          console.log("access_token:", access_token);
          console.log("token:", token);
          console.log("role:", role);
          console.log("profileId:", profileId);
          console.log("user_id:", user_id);
          if (!token || !role || !profileId || !user_id) {
            throw new Error("Missing required data from backend response");
          }
          const tokenData = token.trim();
          const roleData = role.trim();
          const profileIdData = profileId.trim();
          const userIdData = user_id.trim();
          console.log("Trimmed values:", {
            token: tokenData,
            role: roleData,
            profileId: profileIdData,
            user_id: userIdData,
          });
          // Then dispatch to Redux
          dispatch(
            setCredentials({
              token: access_token,
              role,
              profileId,
              user_id,
            })
          );

          // Verify the data was set correctly
          const verifyData = {
            storedToken: localStorage.getItem("token"),
            storedRole: localStorage.getItem("userRole"),
            storedProfileId: localStorage.getItem("profileId"),
            storedUserId: localStorage.getItem("userId"),
          };

          console.log("Verification of stored data:", verifyData);

          if (!verifyData.storedToken || !verifyData.storedRole) {
            throw new Error("Failed to persist authentication data");
          }

          setIsLoggedIn(true);
          toast.success("Đăng nhập thành công!");
          navigate("/EMO/learnAboutEmo");
        } catch (error) {
          console.error("Authentication error:", error);
          toast.error(error.message);
          navigate("/EMO/learnAboutEmo");
        }
      } catch (err) {
        console.error("Network error:", err);
        toast.error("Lỗi kết nối, vui lòng thử lại sau!");
        navigate("/EMO/learnAboutEmo");
      }
    };

    fetchTokenAndCallBE();
  }, [navigate, dispatch, setIsLoggedIn]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
