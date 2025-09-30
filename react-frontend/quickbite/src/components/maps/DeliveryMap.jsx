import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createPin = (color = '#fc8019', emoji = '🛵') => L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        color: white;
        font-size: 16px;
        transform: rotate(45deg);
        font-weight: bold;
      ">${emoji}</div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});


// Helper to interpolate points between two coordinates
function interpolatePoints(start, end, numPoints) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const lat = start.lat + ((end.lat - start.lat) * i) / numPoints;
    const lng = start.lng + ((end.lng - start.lng) * i) / numPoints;
    points.push({ lat, lng });
  }
  return points;
}


// phase: 'to_restaurant' | 'to_customer'
// restaurantPosition, customerPosition, startPosition are optional explicit pins
const DeliveryMap = ({ path, initialCenter, onReachedEnd, forceResize, phase = 'to_restaurant', restaurantPosition, customerPosition, startPosition }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [index, setIndex] = useState(0);

  // Interpolate path if only two points (restaurant, destination)
  let animatedPath = path;
  if (path && path.length === 2) {
    animatedPath = interpolatePoints(path[0], path[1], 60); // smoother: more steps
  }



  // Invalidate size robustly when initialCenter or forceResize changes (e.g., after modal opens)
  useLayoutEffect(() => {
    if (!mapRef.current || !containerRef.current) return;
    // Wait for the container to be visible
    const checkAndResize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mapRef.current.invalidateSize();
        mapRef.current.setView([initialCenter.lat, initialCenter.lng], 13, { animate: true });
        return true;
      }
      return false;
    };
    // Try immediately, then after a short delay if not visible
    if (!checkAndResize()) {
      setTimeout(checkAndResize, 250);
    }
    // Add resize observer for container
    let resizeObserver;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new window.ResizeObserver(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      });
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      if (resizeObserver && containerRef.current) resizeObserver.disconnect();
    };
  }, [initialCenter, forceResize]);

  useEffect(() => {
    if (!animatedPath || animatedPath.length === 0) return;
    setIndex(0);
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = Math.min(prev + 1, animatedPath.length - 1);
        if (next === animatedPath.length - 1) {
          clearInterval(id);
          onReachedEnd && onReachedEnd();
        }
        return next;
      });
    }, 500); // faster updates for realtime feel
    return () => clearInterval(id);
  }, [JSON.stringify(animatedPath)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Follow courier marker
  useEffect(() => {
    if (!mapRef.current) return;
    const point = animatedPath && animatedPath[index] ? animatedPath[index] : initialCenter;
    mapRef.current.setView([point.lat, point.lng], 14, { animate: true });
  }, [index]);

  const courier = animatedPath && animatedPath[index] ? animatedPath[index] : initialCenter;
  const destination = animatedPath && animatedPath[animatedPath.length - 1] ? animatedPath[animatedPath.length - 1] : initialCenter;
  const restaurant = animatedPath && animatedPath[0] ? animatedPath[0] : initialCenter;
  const restaurantMarker = restaurantPosition || (phase === 'to_restaurant' ? restaurant : null);
  const customerMarker = customerPosition || (phase === 'to_customer' ? destination : null);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '400px', minHeight: '400px', maxHeight: '400px', background: '#f5f5f5' }}>
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%', minHeight: '400px', maxHeight: '400px', background: '#f5f5f5' }}
        whenCreated={(map) => { mapRef.current = map; setTimeout(() => map.invalidateSize(), 250); }}
        preferCanvas
      >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {animatedPath && animatedPath.length > 0 && (
        <Polyline positions={animatedPath.map(p => [p.lat, p.lng])} color="#2196f3" weight={4} opacity={0.7} />
      )}
      {/* Restaurant marker (only when navigating to it or explicit) */}
      {restaurantMarker && (
        <Marker position={[restaurantMarker.lat, restaurantMarker.lng]} icon={createPin('#673ab7', '🍴')}>
          <Popup>Restaurant</Popup>
        </Marker>
      )}
      {/* Rider marker */}
      <Marker position={[courier.lat, courier.lng]} icon={createPin('#fc8019', '🛵')}>
        <Popup>Delivery Partner</Popup>
      </Marker>
      {/* Destination marker (only for customer leg or explicit) */}
      {customerMarker && (
        <Marker position={[customerMarker.lat, customerMarker.lng]} icon={createPin('#4caf50', '🏠')}>
          <Popup>Destination</Popup>
        </Marker>
      )}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;


