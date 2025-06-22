import React, { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface ImageUploadProps {
  currentImage?: string;
  onImageSelect: (file: File | null) => void;
  onImageRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageSelect,
  onImageRemove,
  className = '',
  size = 'md'
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getGradientClass } = useTheme();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('ImageUpload: Arquivo selecionado', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('ImageUpload: Processando arquivo', file.name, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('ImageUpload: Preview criado', result.substring(0, 50) + '...');
        setPreview(result);
      };
      reader.readAsDataURL(file);
      console.log('ImageUpload: Chamando onImageSelect');
      onImageSelect(file);
    } else {
      console.log('ImageUpload: Nenhum arquivo selecionado');
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ImageUpload: Botão clicado, abrindo seletor de arquivo');
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ImageUpload: Removendo imagem');
    setPreview(null);
    onImageSelect(null);
    onImageRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview ? (
        <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg`}>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleButtonClick}
          className={`${sizeClasses[size]} ${getGradientClass()} rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 border-4 border-white shadow-md`}
        >
          <div className="text-center">
            <Camera className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Foto</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ImageUpload;