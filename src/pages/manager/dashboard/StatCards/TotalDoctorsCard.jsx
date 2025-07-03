import { useNavigate } from "react-router-dom";
import StatCard from './StatCard';
import { ICON_CONFIG } from '../iconConfig';

// Component hiển thị thẻ Tổng Bác sĩ
const TotalDoctorsCard = ({ totalDoctors }) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate("/manager/viewDoctor")} className="cursor-pointer">
            <StatCard config={ICON_CONFIG.doctors} label="Total Doctors" value={totalDoctors} />
        </div>
    );
};

export default TotalDoctorsCard;