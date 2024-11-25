import React from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Stack 
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

const PortsMap = ({ ports = [] }) => {
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
    <Stack spacing={3}> {/* Adjust spacing between map and table */}
      {/* Ports Table */}
      <TableContainer 
        component={Paper} 
        sx={{
          maxHeight: ports.length > 5 ? '400px' : 'auto', 
          overflowY: 'auto', 
          zIndex: 10  // Ensure table stays above the map
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Number of Gates</TableCell>
              <TableCell>Terminal Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ports.map((port) => (
              <TableRow key={port.id}>
                <TableCell>{port.name}</TableCell>
                <TableCell>{port.latitude}</TableCell>
                <TableCell>{port.longitude}</TableCell>
                <TableCell>{port.no_gates}</TableCell>
                <TableCell>${port.terminal_cost}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Map Container */}
      <MapContainer
        center={getMapCenter()}
        zoom={8}
        style={{ height: '400px', width: '100%' }}
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
                <div>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {port.name}
                  </Typography>
                  <Typography variant="body2">
                    Latitude: {port.latitude}
                  </Typography>
                  <Typography variant="body2">
                    Longitude: {port.longitude}
                  </Typography>
                  <Typography variant="body2">
                    Gates: {port.no_gates || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Terminal Cost: ${port.terminal_cost || 'N/A'}
                  </Typography>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Stack>
  );
};

export default PortsMap;
