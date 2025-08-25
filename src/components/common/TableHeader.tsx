import React from 'react';
import { motion } from 'framer-motion';

interface TableHeaderProps {
  timeframeHeaders: string[];
}

export const TableHeader: React.FC<TableHeaderProps> = ({ timeframeHeaders }) => {
  return (
    <motion.div
      className="hidden lg:block mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-gray-900/20 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-6" /> {/* Spacer for expand button */}
            <div className="w-[200px]">
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                Cryptocurrency
              </span>
            </div>
            <div className="w-[120px]">
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                Price
              </span>
            </div>
            <div className="w-[80px] text-center">
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                AI Score
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 ml-8">
            {timeframeHeaders.map((timeframe) => (
              <div key={timeframe} className="text-center min-w-[80px]">
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">
                  {timeframe}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};