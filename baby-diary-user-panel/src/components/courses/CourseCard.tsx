import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CourseCard: React.FC<{ course: any }> = ({ course }) => {
  const navigate = useNavigate();
  return (
    <div
      className="relative aspect-[9/16] w-40 md:w-48 lg:w-56 flex-shrink-0 cursor-pointer group rounded-xl overflow-hidden transition-transform duration-200 hover:scale-105"
      onClick={() => navigate(`/courses/${course.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <img
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
    </div>
  );
}; 