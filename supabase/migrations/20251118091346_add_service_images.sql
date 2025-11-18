/*
  # Add Service Images

  ## Overview
  This migration adds support for multiple images per service, allowing vendors to showcase
  their work through a photo gallery similar to product pages on e-commerce sites.

  ## New Tables

  ### 1. `service_images`
  Images for services uploaded by vendors
  - `id` (uuid, primary key)
  - `service_id` (uuid, references services)
  - `image_url` (text, not null) - URL to the image
  - `display_order` (integer, default 0) - Order of images in gallery
  - `is_primary` (boolean, default false) - Primary/featured image
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on service_images table
  - Vendors can only manage images for their own services
  - Anyone authenticated can view images for available services

  ## Notes
  - Multiple images per service supported
  - One primary image per service for thumbnails
  - Images ordered by display_order for consistent gallery display
*/

-- Create service_images table
CREATE TABLE IF NOT EXISTS service_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_service_images_service ON service_images(service_id);
CREATE INDEX IF NOT EXISTS idx_service_images_order ON service_images(display_order);
CREATE INDEX IF NOT EXISTS idx_service_images_primary ON service_images(is_primary);

-- Enable Row Level Security
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;

-- Service images policies
CREATE POLICY "Anyone can view images for available services"
  ON service_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_images.service_id
      AND (is_available = true OR vendor_id = auth.uid())
    )
  );

CREATE POLICY "Vendors can insert images for own services"
  ON service_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_images.service_id
      AND vendor_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update images for own services"
  ON service_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_images.service_id
      AND vendor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_images.service_id
      AND vendor_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can delete images for own services"
  ON service_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_images.service_id
      AND vendor_id = auth.uid()
    )
  );