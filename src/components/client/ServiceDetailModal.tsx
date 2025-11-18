import { useState } from 'react';
import { Service } from '../../lib/supabase';
import { X, DollarSign, Tag, User, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceDetailModalProps {
  service: Service;
  onClose: () => void;
}

export default function ServiceDetailModal({ service, onClose }: ServiceDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = service.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {hasImages && (
            <div className="mb-6">
              <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden group">
                <img
                  src={images[currentImageIndex].image_url}
                  alt={`${service.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition ${
                            index === currentImageIndex
                              ? 'bg-white w-8'
                              : 'bg-white/60 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-6 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                        index === currentImageIndex
                          ? 'border-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Category</span>
              </div>
              <p className="text-lg text-gray-900">{service.category?.name}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{service.description}</p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-baseline gap-2 mb-6">
                <DollarSign className="w-6 h-6 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">{service.price.toFixed(2)}</span>
                <span className="text-gray-600">/ {service.price_unit}</span>
              </div>
            </div>

            {service.vendor && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {service.vendor.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <User className="w-4 h-4" />
                        {service.vendor.full_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${service.vendor.email}`} className="hover:text-blue-600 transition">
                      {service.vendor.email}
                    </a>
                  </div>
                  {service.vendor.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${service.vendor.phone}`} className="hover:text-blue-600 transition">
                        {service.vendor.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
