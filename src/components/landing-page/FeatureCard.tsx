import * as React from 'react';

// Props interface - defines what data this component needs
export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className='group rounded-card bg-white p-8 shadow-elevated-1 transition-all duration-300 hover:shadow-elevated-2'>
      <div className='flex items-start gap-4'>
        {/* Icon Container */}
        {icon && (
          <div className='flex-shrink-0 rounded-lg bg-primary-50 p-3 transition-colors duration-300 group-hover:bg-primary-100'>
            {icon}
          </div>
        )}

        {/* Text Content */}
        <div className='flex-1'>
          <h3 className='mb-2 text-xl font-bold text-dark'>{title}</h3>
          <p className='leading-relaxed text-gray-600'>{description}</p>
        </div>
      </div>
    </div>
  );
};
