import { useNavigate } from "react-router-dom";
import StatCard from './StatCard';
import { ICON_CONFIG } from '../iconConfig';

// Component hiển thị thẻ Người dùng mới
const NewUsersCard = ({ totalUsers, users, getGenderTotalUsers }) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate("/manager/viewCustomer")} className="cursor-pointer">
            <StatCard
                config={ICON_CONFIG.users}
                label="New Users"
                value={totalUsers}
                details={
                    <div>
                        <strong className="text-blue-400">Male</strong>: <span>{users.male}</span> |
                        <strong className="text-pink-400"> Female</strong>: <span>{users.female}</span> |
                        <strong className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent"> Other</strong>: <span>{users.else}</span>
                        <br />
                        <span> <span className="text-green-800">Total User:</span> {getGenderTotalUsers()}</span>
                    </div>
                }
            />
        </div>
    );
};

export default NewUsersCard;