import { useNavigate } from "react-router-dom";
import StatCard from './StatCard';
import { ICON_CONFIG } from '../iconConfig';

// Component hiển thị thẻ Tổng Doanh thu
const TotalRevenueCard = ({ totalRevenue }) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate("/manager/transaction")} className="cursor-pointer">
            <StatCard config={ICON_CONFIG.revenue} label="Total Revenue" value={totalRevenue} />
        </div>
    );
};

export default TotalRevenueCard;