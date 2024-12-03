import React from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { 
  Typography, 
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import 'leaflet/dist/leaflet.css';

// Custom red marker icon
const redMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PortMap = ({ ports = [] }) => {
  // Use theme to check for mobile devices
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate the map center based on the ports array
  const getMapCenter = () => {
    const validPorts = ports.filter(port => 
      port && 
      !isNaN(parseFloat(port.latitude)) && 
      !isNaN(parseFloat(port.longitude))
    );

    // Default to Cebu if no valid ports
    if (validPorts.length === 0) return [10.3157, 123.8907];

    const sum = validPorts.reduce(
      (acc, port) => ({
        lat: acc.lat + parseFloat(port.latitude),
        lng: acc.lng + parseFloat(port.longitude),
      }),
      { lat: 0, lng: 0 }
    );

    return [
      sum.lat / validPorts.length, 
      sum.lng / validPorts.length
    ];
  };

  return (
    <Box 
      sx={{
        width: '100%',
        height: isMobile ? '250px' : '400px',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <MapContainer
        center={getMapCenter()}
        zoom={isMobile ? 6 : 8}
        style={{ 
          height: '100%', 
          width: '100%',
          zIndex: 1
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {ports.map((port) => {
          // Validate port object has valid coordinates
          if (!port || 
              isNaN(parseFloat(port.latitude)) || 
              isNaN(parseFloat(port.longitude))) {
            return null;
          }

          return (
            <Marker
              key={port.id}
              position={[parseFloat(port.latitude), parseFloat(port.longitude)]}
              icon={redMarkerIcon}
            >
              <Popup>
                <Box sx={{ 
                  maxWidth: isMobile ? '200px' : '300px',
                  fontSize: isMobile ? '0.8rem' : '1rem'
                }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontSize: isMobile ? '1rem' : '1.25rem',
                      marginBottom: '8px'
                    }}
                  >
                    {port.name}
                  </Typography>
                  {!isMobile && (
                    <>
                      <Typography variant="body2">
                        Latitude: {port.latitude}
                      </Typography>
                      <Typography variant="body2">
                        Longitude: {port.longitude}
                      </Typography>
                    </>
                  )}
                  <Typography variant="body2">
                    Gates: {port.no_gates || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Terminal Cost: ${port.terminal_cost || 'N/A'}
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default PortMap;