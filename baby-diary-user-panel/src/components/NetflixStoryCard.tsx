import React from 'react';
import { Play, Clock, CheckCircle } from 'lucide-react';

interface NetflixStoryCardProps {
  image: string;
  title: string;
  duration?: number;
  isCompleted?: boolean;
  onClick?: () => void;
  className?: string;
}

const NetflixStoryCard: React.FC<NetflixStoryCardProps> = ({
  image,
  title,
  duration,
  isCompleted = false,
  onClick,
  className = ''
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <div 
      className={`netflix-story-card netflix-hover cursor-pointer ${className}`}
      onClick={onClick}
    >
      <img 
        src={image} 
        alt={title}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay gradiente */}
      <div className="overlay" />
      
      {/* Conteúdo */}
      <div className="content">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
          {isCompleted && (
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          )}
        </div>
        
        {duration && (
          <div className="flex items-center gap-1 text-xs text-gray-300">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(duration)}</span>
          </div>
        )}
        
        {/* Botão play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white bg-opacity-90 rounded-full p-2">
            <Play className="w-4 h-4 text-black fill-black" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetflixStoryCard; 