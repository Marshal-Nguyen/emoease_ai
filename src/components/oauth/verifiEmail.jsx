import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyDoctorEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Lấy access_token từ URL
        const hash = window.location.hash;
        if (!hash) {
          setVerificationStatus("error");
          setErrorMessage("Không tìm thấy token xác thực");
          return;
        }

        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");

        if (!accessToken) {
          setVerificationStatus("error");
          setErrorMessage("Token không hợp lệ");
          return;
        }

        // Giải mã JWT để lấy userId (sub)
        const tokenParts = accessToken.split(".");
        if (tokenParts.length !== 3) {
          setVerificationStatus("error");
          setErrorMessage("Token không đúng định dạng");
          return;
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.sub;

        // Gọi API để verify doctor email
        await axios.post("/api/verify-doctor-email", { userId });
        setVerificationStatus("success");

        // Chuyển hướng sau 3 giây
        setTimeout(() => {
          navigate("/EMO");
        }, 3000);
      } catch (error) {
        console.error("Error verifying email:", error);
        setVerificationStatus("error");
        setErrorMessage(
          error.response?.data?.message || "Có lỗi xảy ra khi xác thực email"
        );
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Xác thực Email
          </h2>
          <div className="mt-8">
            {verificationStatus === "verifying" && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-lg text-gray-600">
                  Đang xác thực email của bạn...
                </p>
              </div>
            )}

            {verificationStatus === "success" && (
              <div className="flex flex-col items-center">
                <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="mt-4 text-lg text-gray-600">
                  Email đã được xác thực thành công!
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây...
                </p>
              </div>
            )}

            {verificationStatus === "error" && (
              <div className="flex flex-col items-center">
                <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="mt-4 text-lg text-red-600">{errorMessage}</p>
                <button
                  onClick={() => navigate("/EMO")}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  Quay lại trang đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDoctorEmail;
