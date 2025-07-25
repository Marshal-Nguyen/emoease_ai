import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentCallback = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tranID = searchParams.get("apptransid");
  const token = localStorage.getItem("token");
  console.log(tranID);

  useEffect(() => {
    const processZaloPayCallback = async () => {
      if (!tranID) {
        navigate("/EMO/payment-failure", {
          state: { error: "Không tìm thấy mã giao dịch" },
        });
        return;
      }

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API}/payment-zalo/check-payment-status/${tranID}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (data.success && data.status === "Success") {
          navigate("/EMO/payment-success", {
            state: {
              transactionNo: tranID,
              amount: data.amount,
              payDate: data.timestamp,
              bookingId: data.bookingId,
            },
          });
        } else {
          navigate("/EMO/payment-failure", {
            state: {
              message: "Thanh toán chưa hoàn tất hoặc thất bại",
              status: data.status,
            },
          });
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra giao dịch:", err);
        navigate("/EMO/payment-failure", {
          state: { error: "Không thể kiểm tra trạng thái giao dịch" },
        });
      } finally {
        setLoading(false);
      }
    };

    processZaloPayCallback();
  }, [location.search, navigate]);

  console.log(loading);

  return (
    <div className="payment-callback-container">
      {loading && (
        <div className="loading">Đang kiểm tra trạng thái thanh toán...</div>
      )}
    </div>
  );
};

export default PaymentCallback;
