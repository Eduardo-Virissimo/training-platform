'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SelectedImage {
  src: string;
  alt: string;
  filename: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: SelectedImage;
}

export function ImageModal({ isOpen, onClose, image }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay preto 50% opacidade */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Conteúdo da modal */}
      <div className="relative z-10 max-w-4xl max-h-[90vh] w-full">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 truncate">{image.filename}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Imagem em tamanho maior */}
          <div className="p-4 bg-gray-50">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
