import { Users, Briefcase, ShoppingCart, DollarSign, TrendingUp, CreditCard, Clock, Star } from "lucide-react";
import { COLORS } from './colors';

// Cấu hình icon cho các thẻ và biểu đồ
export const ICON_CONFIG = {
    users: { Icon: Users, color: COLORS.primary, bg: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}80)` },
    doctors: { Icon: Briefcase, color: COLORS.secondary, bg: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondary}80)` },
    sales: { Icon: ShoppingCart, color: COLORS.accent, bg: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}80)` },
    revenue: { Icon: DollarSign, color: COLORS.success, bg: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}80)` },
    subscriptions: { Icon: CreditCard, color: COLORS.primary, bg: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}80)` },
    bookings: { Icon: Clock, color: COLORS.accent, bg: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}80)` },
    topDoctors: { Icon: Star, color: COLORS.danger, bg: `linear-gradient(135deg, ${COLORS.danger}, ${COLORS.danger}80)` },
    growth: { Icon: TrendingUp, color: COLORS.secondary, bg: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondary}80)` },
    salesOverview: { Icon: TrendingUp, color: COLORS.accent, bg: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}80)` },
    revenueGrowth: { Icon: DollarSign, color: COLORS.success, bg: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}80)` },
    userDistribution: { Icon: Users, color: COLORS.primary, bg: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}80)` },
    performance: { Icon: Star, color: COLORS.warning, bg: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}80)` },
};