import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';

const PortsTable = ({ ports = [] }) => {
  // Use theme to check for mobile devices
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer 
        component={Paper} 
        sx={{
          maxHeight: ports.length > 5 ? '300px' : 'auto', 
          overflowY: 'auto', 
          width: '100%',
          '& .MuiTable-root': {
            width: '100%',
            minWidth: isMobile ? '300px' : 'auto'
          },
          '@media (max-width: 600px)': {
            fontSize: '0.8rem'
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {isMobile ? (
                <>
                  <TableCell>Name</TableCell>
                  <TableCell>Gates</TableCell>
                  <TableCell>Cost</TableCell>
                </>
              ) : (
                <>
                  <TableCell>Name</TableCell>
                  <TableCell>Latitude</TableCell>
                  <TableCell>Longitude</TableCell>
                  <TableCell>Number of Gates</TableCell>
                  <TableCell>Terminal Cost</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {ports.map((port) => (
              <TableRow key={port.id}>
                {isMobile ? (
                  <>
                    <TableCell>{port.name}</TableCell>
                    <TableCell>{port.no_gates}</TableCell>
                    <TableCell>${port.terminal_cost}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{port.name}</TableCell>
                    <TableCell>{port.latitude}</TableCell>
                    <TableCell>{port.longitude}</TableCell>
                    <TableCell>{port.no_gates}</TableCell>
                    <TableCell>${port.terminal_cost}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PortsTable;