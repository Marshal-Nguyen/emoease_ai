import { memo } from "react";
import { motion } from "framer-motion";
import { COLORS } from '../colors';

// Component thẻ thống kê
const StatCard = memo(({ config, label, value, details }) => (
    <motion.div
        className="p-5 rounded-xl shadow-lg flex items-center gap-4 transition-transform hover:scale-105"
        style={{ background: 'linear-gradient(145deg, #FFFFFF, #F3F4F6)', border: `1px solid ${COLORS.border}` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="p-3 rounded-full relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: config.bg }} />
            <config.Icon className="w-6 h-6 relative z-10 text-white" />
        </div>
        <div>
            <p className="text-sm font-bold tracking-wide uppercase" style={{ color: config.color, letterSpacing: '0.05em' }}>{label}</p>
            <h3 className="text-2xl font-bold mt-1" style={{ color: COLORS.number }}>{value}</h3>
            {details && (
                <div className="mt-2 text-sm text-gray-800">
                    {details}
                </div>
            )}
        </div>
    </motion.div>
));

export default StatCard;