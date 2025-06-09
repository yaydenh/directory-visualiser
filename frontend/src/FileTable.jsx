
import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box'
import { VariableSizeGrid  as Grid } from 'react-window'

import DirectoryButton from './DirectoryButton';

function FileTable({ dataReady, root }) {

  const [ columnWidths, setColumnWidths ] = useState([500, 100, 100, 100, 200, 200])
  const [ data, setData ] = useState([]);

  const columnMapping = ['path', 'directory', 'size', 'extension', 'created', 'lastModified']

  const Cell = ({ rowIndex, columnIndex, style }) => {
    
    const row = data[rowIndex];

    let value = row[columnMapping[columnIndex]];
    if (columnMapping[columnIndex] === 'directory') {
      value = value ? "Yes" : "No"
    } else if (columnMapping[columnIndex] === 'path') {
      value = value.split('/').pop();
    }

    const directoryIcon = columnIndex === 0 && row.directory;

    return (
    <div style={{ ...style, color: 'black', textAlign: 'left', marginLeft: (columnIndex === 0) * 30 * row.depth }}>
      {directoryIcon && (
        <DirectoryButton directoryId={row.id} isOpen={row.open} openDirectory={openDirectory} closeDirectory={closeDirectory} />
      )}
      {value}
    </div>
    );
  };

  const openDirectory = async (directoryId) => {

    const directoryIndex = data.findIndex(file => file.id === directoryId);
    if (directoryIndex === -1) return;  

    const directoryData = data[directoryIndex];
    if (directoryData.open) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/files?directory=${directoryData.path}`, { method: 'GET' });
      const childrenData = await res.json();

      const updatedData = [...data];
      updatedData[directoryIndex] = { ...directoryData, open: true};

      if (childrenData.length === 0) {
        setData(updatedData);
        return;
      }

      childrenData.forEach(file => {
        if (file.directory) file.open = false;
        file.depth = directoryData.depth + 1;
      });

      setData([
        ...updatedData.slice(0, directoryIndex + 1),
        ...childrenData,
        ...data.slice(directoryIndex + 1)
      ]);
    } catch (error) {
      console.error('Failed to open directory:', error);
    }

  };

  const closeDirectory = (directoryId) => {
    const directoryIndex = data.findIndex(file => file.id === directoryId);
    if (directoryIndex === -1) return;  

    const directoryData = data[directoryIndex];
    if (!directoryData.open) return;

    const lastChildIndex = data.findIndex((file, i) => 
      i > directoryIndex && file.depth <= directoryData.depth
    );

    const endIndex = lastChildIndex === -1 ? data.length : lastChildIndex;

    const updatedData = [
      ...data.slice(0, directoryIndex),
      {...directoryData, open: false},
      ...data.slice(endIndex)
    ];

    setData(updatedData);
  };

  // load root dir initially
  useEffect(() => {
    if (!dataReady) return;

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/by-path?path=${root}`, { method: 'GET' });
        const directoryData = await res.json();
        directoryData.open = false;
        directoryData.depth = 0;
        setData([directoryData]);
      } catch (error) {
        console.error('Failed to get root:', error);
      }

    })();

  }, [dataReady]);

  return (
    <Box display={'flex'} flexDirection={'column'} sx={{ width: '100%', height: '100%', bgcolor: 'lightgrey'}}>
      <Box display={'flex'} textAlign={'left'} color={'red'}>
        {columnMapping.map((col, index) => (
          <div key={col} style={{width: columnWidths[index], height: '20px' }}>
            {col}
          </div>
        ))}
      </Box>
      <Grid
        width={2000}
        height={500}
        columnCount={6}
        columnWidth={index => columnWidths[index]}
        rowCount={data.length}
        rowHeight={() => 20}
      >
        {Cell}
      </Grid>
    </Box>
  )
}

export default FileTable;