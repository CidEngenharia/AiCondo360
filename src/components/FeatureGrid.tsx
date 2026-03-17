import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { UserRole, PricingPlan } from '../constants';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureGridProps {
  features: any[];
  userPlan: PricingPlan;
  userRole: UserRole;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ features, userPlan, userRole }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4">
      {features.map((feature, index) => {
        const hasAccess = userRole === 'global_admin' || feature.plans.includes(userPlan);
        const Content = (
          <>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-white transition-transform group-hover:rotate-3",
              feature.color,
              !hasAccess && "grayscale opacity-50"
            )}>
              <feature.icon size={24} />
            </div>
            <span className={cn(
              "text-[10px] sm:text-xs font-medium text-center leading-tight",
              hasAccess ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"
            )}>
              {feature.label}
            </span>
            {!hasAccess && (
              <div className="absolute top-1 right-1">
                <Lock size={10} className="text-slate-400 dark:text-slate-600" />
              </div>
            )}
          </>
        );

        const commonClasses = cn(
          "flex flex-col items-center justify-center p-3 rounded-2xl shadow-sm border transition-all group relative h-full",
          hasAccess 
            ? "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md"
            : "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-60"
        );

        if (!hasAccess) {
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={commonClasses}
            >
              {Content}
            </motion.div>
          );
        }

        return (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to={`/feature/${feature.id}`} className={commonClasses}>
              {Content}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};
