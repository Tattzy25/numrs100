import React from 'react';

interface ProgressBarProps {
  progress: number;
  text?: string;
  color?: 'purple' | 'green' | 'yellow' | 'red';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  text,
  color = 'purple',
  showPercentage = true,
}) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-700',
    green: 'from-green-500 to-green-700',
    yellow: 'from-yellow-500 to-yellow-700',
    red: 'from-red-500 to-red-700',
  };

  return (
    <div className="w-full">
      {(text || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {text && <span className="text-sm text-gray-400">{text}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-300">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={`bg-gradient-to-r ${colorClasses[color]} h-2 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};