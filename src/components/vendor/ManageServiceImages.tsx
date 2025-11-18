import { useState, useEffect } from 'react';
import { supabase, ServiceImage } from '../../lib/supabase';
import { X, Upload, Star, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface ManageServiceImagesProps {
  serviceId: string;
  serviceTitle: string;
  onClose: () => void;
}

export default function ManageServiceImages({ serviceId, serviceTitle, onClose }: ManageServiceImagesProps) {
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [serviceId]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('service_images')
        .select('*')
        .eq('service_id', serviceId)
        .order('display_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const addImage = async () => {
    if (!imageUrl.trim()) return;

    setUploading(true);
    try {
      const maxOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) : -1;
      const isPrimary = images.length === 0;

      const { error } = await supabase.from('service_images').insert({
        service_id: serviceId,
        image_url: imageUrl.trim(),
        display_order: maxOrder + 1,
        is_primary: isPrimary,
      });

      if (error) throw error;
      setImageUrl('');
      fetchImages();
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id: string, wasPrimary: boolean) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await supabase.from('service_images').delete().eq('id', id);
      if (error) throw error;

      if (wasPrimary && images.length > 1) {
        const nextImage = images.find(img => img.id !== id);
        if (nextImage) {
          await supabase
            .from('service_images')
            .update({ is_primary: true })
            .eq('id', nextImage.id);
        }
      }

      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const setPrimary = async (id: string) => {
    try {
      await supabase
        .from('service_images')
        .update({ is_primary: false })
        .eq('service_id', serviceId);

      await supabase
        .from('service_images')
        .update({ is_primary: true })
        .eq('id', id);

      fetchImages();
    } catch (error) {
      console.error('Error setting primary:', error);
    }
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === images.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentImage = images[currentIndex];
    const targetImage = images[targetIndex];

    try {
      await supabase
        .from('service_images')
        .update({ display_order: targetImage.display_order })
        .eq('id', currentImage.id);

      await supabase
        .from('service_images')
        .update({ display_order: currentImage.display_order })
        .eq('id', targetImage.id);

      fetchImages();
    } catch (error) {
      console.error('Error moving image:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">Manage Images: {serviceTitle}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Image
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addImage}
                disabled={uploading || !imageUrl.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Adding...' : 'Add'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter a public image URL. For demo purposes, you can use free stock photos from sources like Unsplash or Pexels.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading images...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No images yet</p>
              <p className="text-sm text-gray-500 mt-1">Add your first image above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`relative group border-2 rounded-xl overflow-hidden ${
                    image.is_primary ? 'border-yellow-400' : 'border-gray-200'
                  }`}
                >
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={image.image_url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {image.is_primary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Primary
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    {!image.is_primary && (
                      <button
                        onClick={() => setPrimary(image.id)}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition"
                        title="Set as primary"
                      >
                        <Star className="w-5 h-5 text-yellow-500" />
                      </button>
                    )}
                    <button
                      onClick={() => moveImage(image.id, 'up')}
                      disabled={index === 0}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                      title="Move up"
                    >
                      <MoveUp className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => moveImage(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                      title="Move down"
                    >
                      <MoveDown className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => deleteImage(image.id, image.is_primary)}
                      className="p-2 bg-white rounded-lg hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
