import DailyRevenueChart from '../DailyRevenueChart';
import NewUsersCard from './NewUsersCard';
import TotalRevenueCard from './TotalRevenueCard';
import ServicePackagesCard from './ServicePackagesCard';
import TotalBookingsCard from './TotalBookingsCard';
import TotalDoctorsCard from './TotalDoctorsCard';
import TopDoctorsCard from './TopDoctorsCard';

// Component tổ chức layout cho phần tổng quan
const OverviewSection = ({ state, getGenderTotalUsers }) => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        <DailyRevenueChart dailySales={state.dailySales} />
        <div className="space-y-2">
            <NewUsersCard
                totalUsers={state.totalUsers}
                users={state.users}
                getGenderTotalUsers={getGenderTotalUsers}
            />
            <TotalRevenueCard totalRevenue={state.totalRevenue} />
            <ServicePackagesCard productsSold={state.productsSold} />
        </div>
        <div className="space-y-2">
            <TotalBookingsCard bookings={state.bookings} />
            <TotalDoctorsCard totalDoctors={state.totalDoctors} />
            <TopDoctorsCard topDoctors={state.topDoctors} />
        </div>
    </div>
);

export default OverviewSection;