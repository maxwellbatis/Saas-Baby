import React from 'react';

export const CourseBanner: React.FC<{ course: any }> = ({ course }) => {
  return (
    <div className="relative w-full h-[350px] md:h-[500px] flex items-end bg-black">
      <img
        src={course.thumbnail}
        alt={course.title}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="relative z-10 p-8 md:p-16 max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">{course.title}</h1>
        <p className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-3 drop-shadow">
          {course.description}
        </p>
        <div className="flex gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded text-lg shadow">
            Assistir Agora
          </button>
          <button className="bg-white bg-opacity-80 hover:bg-opacity-100 text-black font-bold py-2 px-6 rounded text-lg shadow">
            Saiba Mais
          </button>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
    </div>
  );
}; 