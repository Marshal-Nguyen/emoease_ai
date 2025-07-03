import StatCard from './StatCard';
import { ICON_CONFIG } from '../iconConfig';

// Component hiển thị thẻ Gói Dịch vụ Đã Bán
const ServicePackagesCard = ({ productsSold }) => (
    <StatCard
        config={ICON_CONFIG.sales}
        label="Service Packages Sold"
        value={productsSold.total}
        details={productsSold.details.map((item, i) => (
            <p
                key={i}
                className="my-1 flex justify-between"
                style={{ color: ['blue', 'red', 'green', 'purple', 'orange'][i % 5] }}
            >
                <span>{i + 1}. {item.name}</span>
                <strong>{item.totalSubscriptions}</strong>
            </p>
        ))}
    />
);

export default ServicePackagesCard;