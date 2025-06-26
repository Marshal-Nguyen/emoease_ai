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
    const handleOAuthCallback = async () => {
      try {
        // Bước 1: Đổi mã code từ Google thành session
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error || !data?.session) {
          console.error("Lỗi khi đổi mã code:", error);
          toast.error("Đăng nhập thất bại!");
          navigate("/EMO/learnAboutEmo");
          return;
        }

        const access_token = data.session.access_token;

        // Bước 2: Gọi API backend xác thực và lấy thông tin người dùng
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

        if (!token || !role || !profileId || !user_id) {
          throw new Error("Dữ liệu trả về từ backend không đầy đủ");
        }

        // Bước 3: Lưu thông tin vào Redux
        dispatch(
          setCredentials({
            token: access_token,
            role,
            profileId,
            user_id,
          })
        );

        // Bước 4: Cập nhật trạng thái đăng nhập
        setIsLoggedIn(true);
        toast.success("Đăng nhập thành công!");
        navigate("/EMO/learnAboutEmo");
      } catch (err) {
        console.error("Lỗi khi xử lý callback:", err);
        toast.error("Lỗi khi đăng nhập bằng Google!");
        navigate("/EMO/learnAboutEmo");
      }
    };

    handleOAuthCallback();
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
