import React from 'react';
import { CourseCard } from './CourseCard';

export const CourseCarousel: React.FC<{ courses: any[] }> = ({ courses }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-black">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}; 