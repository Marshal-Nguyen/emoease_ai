import StatCard from './StatCard';
import { ICON_CONFIG } from '../iconConfig';

// Component hiển thị thẻ Bác sĩ Hàng đầu
const TopDoctorsCard = ({ topDoctors }) => (
    <StatCard
        config={ICON_CONFIG.topDoctors}
        label="Top Performing Doctors"
        details={topDoctors.details.map((item, i) => (
            <div
                key={i}
                className="my-1 flex justify-between"
                style={{ color: ['red', 'orange', 'green', 'purple', 'blue'][i % 5] }}
            >
                <span>{i + 1}. {item.fullName}</span>
                <strong>{item.bookings}</strong>
            </div>
        ))}
    />
);

export default TopDoctorsCard;