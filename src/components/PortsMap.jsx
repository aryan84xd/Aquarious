// PortsMap.jsx
import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icon

const PortsMap = ({ ports }) => {
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
      }, []);
      
  // Find center of all ports, or default to Philippines
  const getMapCenter = () => {
    if (ports.length === 0) return [10.3157, 123.8907];
    
    const validPorts = ports.filter(port => {
      const location = port.location?.replace('POINT(', '').replace(')', '').split(' ');
      return location && location.length === 2;
    });

    if (validPorts.length === 0) return [10.3157, 123.8907];

    const sum = validPorts.reduce((acc, port) => {
      const location = port.location.replace('POINT(', '').replace(')', '').split(' ');
      return {
        lat: acc.lat + parseFloat(location[1]),
        lng: acc.lng + parseFloat(location[0])
      };
    }, { lat: 0, lng: 0 });

    return [sum.lat / validPorts.length, sum.lng / validPorts.length];
  };

  return (
    <MapContainer
      center={getMapCenter()}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {ports.map((port) => {
        const location = port.location?.replace('POINT(', '').replace(')', '').split(' ');
        if (!location || location.length !== 2) return null;

        const latitude = parseFloat(location[1]);
        const longitude = parseFloat(location[0]);
        
        if (isNaN(latitude) || isNaN(longitude)) return null;

        return (
          <Marker 
            key={port.id} 
            position={[latitude, longitude]}
          >
            <Popup>
              <div>
                <Typography variant="subtitle1" component="h3" gutterBottom>
                  {port.name}
                </Typography>
                <Typography variant="body2">
                  Gates: {port.no_gates}
                </Typography>
                <Typography variant="body2">
                  Cost: ${port.terminal_cost}
                </Typography>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default PortsMap;