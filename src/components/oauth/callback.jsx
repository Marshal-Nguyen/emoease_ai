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
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          console.error("Supabase session error:", error);
          toast.error("Đăng nhập thất bại!");
          navigate("/EMO/learnAboutEmo");
          return;
        }

        const access_token = data.session.access_token;

        // Gửi access_token lên backend để xác thực
        const res = await axios.post(
          `${import.meta.env.VITE_API}/auth/google/callback`,
          { access_token },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const { token, role, profileId, user_id } = res.data;

        if (!token || !role || !profileId || !user_id) {
          throw new Error("Thiếu dữ liệu trả về từ backend");
        }

        // Lưu vào Redux
        dispatch(
          setCredentials({
            token: access_token,
            role,
            profileId,
            user_id,
          })
        );

        setIsLoggedIn(true);
        toast.success("Đăng nhập thành công!");

        // --- Thêm logic kiểm tra IsProfileCompleted ---
        try {
          const patientRes = await axios.get(
            `${import.meta.env.VITE_API}/patient-profiles/${profileId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const patientData = patientRes.data;
          if (patientData && patientData.IsProfileCompleted === false) {
            navigate("/daily-habits");
            return;
          }
        } catch (err) {
          console.error("Error fetching patient profile:", err);
          // Có thể xử lý lỗi hoặc bỏ qua
        }
        // --- End logic ---

        navigate("/EMO/learnAboutEmo");
      } catch (err) {
        console.error("Lỗi xác thực:", err);
        toast.error("Không thể đăng nhập bằng Google!");
        navigate("/EMO/learnAboutEmo");
      }
    };

    fetchSession();
  }, [navigate, dispatch, setIsLoggedIn]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
