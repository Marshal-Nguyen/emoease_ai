import { useNavigate } from "react-router-dom";
import StatCard from "./StatCard";
import { ICON_CONFIG } from "../iconConfig";

// Component hiển thị thẻ Tổng Lịch Hẹn
const TotalBookingsCard = ({ bookings }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/manager/booking")}
      className="cursor-pointer"
    >
      <StatCard
        config={ICON_CONFIG.bookings}
        label="Total Bookings"
        value={bookings.total}
        details={Object.entries(bookings.details).map(([status, count], i) => (
          <p
            key={i}
            className="my-1 flex justify-between"
            style={{ color: ["green", "orange", "purple", "red"][i % 4] }}
          >
            <span>{status}</span>
            <strong>{count}</strong>
          </p>
        ))}
      />
    </div>
  );
};

export default TotalBookingsCard;
