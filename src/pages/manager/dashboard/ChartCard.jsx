import { memo } from "react";
import { motion } from "framer-motion";
import { COLORS } from './colors';

// Component thẻ biểu đồ
const ChartCard = memo(({ title, children, config }) => (
    <motion.div
        className="p-6 rounded-xl shadow-lg transition-transform hover:scale-102"
        style={{ background: 'linear-gradient(145deg, #FFFFFF, #F3F4F6)', border: `1px solid ${COLORS.border}` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: config.bg }} />
                <config.Icon className="w-5 h-5 relative z-10 text-white" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-gray-800">
                {title}
            </h2>
        </div>
        {children}
    </motion.div>
));

export default ChartCard;