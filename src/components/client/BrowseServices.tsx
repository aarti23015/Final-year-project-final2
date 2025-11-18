import { useState } from 'react';
import { Service } from '../../lib/supabase';
import { DollarSign, Tag, User, Search, Eye, Image } from 'lucide-react';
import ServiceDetailModal from './ServiceDetailModal';

interface BrowseServicesProps {
  services: Service[];
  loading: boolean;
}

export default function BrowseServices({ services, loading }: BrowseServicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const categories = Array.from(
    new Set(services.map((s) => s.category?.name).filter(Boolean))
  );

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vendor?.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || service.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading services...</div>;
  }

  return (
    <>
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Services</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services, vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600">No services found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const primaryImage = service.images?.find(img => img.is_primary) || service.images?.[0];
            const hasImages = service.images && service.images.length > 0;

            return (
              <div
                key={service.id}
                className="group bg-white border border-gray-200 rounded-xl hover:shadow-xl transition overflow-hidden cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                {hasImages && primaryImage ? (
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={primaryImage.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {service.images && service.images.length > 1 && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        {service.images.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Image className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition">{service.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Tag className="w-4 h-4" />
                      <span>{service.category?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{service.vendor?.full_name}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
                      <DollarSign className="w-5 h-5" />
                      <span>{service.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-500 font-normal">/ {service.price_unit}</span>
                    </div>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium group-hover:bg-blue-600 group-hover:text-white transition"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Click on any service card to view full details and vendor information. Or go to "Create Request" to publish a request and get bids from multiple vendors!
          </p>
        </div>
      </div>
    </>
  );
}
