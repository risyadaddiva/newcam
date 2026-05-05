'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const SHOP_LOCATION = { lat: -6.9089, lng: 107.7231 };

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a0805' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a0805' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#c8b89a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3d1f14' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2c1410' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#c8b89a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#5c3020' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#150604' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8a6a55' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2c1410' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1f2a10' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2c1410' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9880c' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#e8a820' }] },
];

export default function MapPicker({ onLocationSelected }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const googleRef = useRef(null);

}
// Map Picker telah dihapus. Untuk ongkir, admin akan menghubungi Anda melalui WhatsApp.
