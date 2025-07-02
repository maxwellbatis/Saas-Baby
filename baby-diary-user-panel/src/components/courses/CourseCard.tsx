import React from 'react';

export const CourseCard: React.FC<{ course: any }> = ({ course }) => {
  return (
    <div className="relative w-40 md:w-56 flex-shrink-0 cursor-pointer group">
      <img
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-60 md:h-80 object-cover rounded-lg group-hover:scale-105 transition-transform shadow-lg"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 rounded-b-lg">
        <h3 className="text-white text-base font-bold truncate">{course.title}</h3>
      </div>
    </div>
  );
}; 