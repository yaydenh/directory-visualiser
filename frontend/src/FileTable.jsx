
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

  const openDirectory = (directoryId) => {

    const directoryIndex = data.findIndex(file => file.id === directoryId);
    if (directoryIndex === -1) return;  

    const directoryData = data[directoryIndex];
    if (directoryData.open) return;

    (async () => {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/files?directory=${directoryData.path}`, { method: 'GET' });
      const jsonData = await res.json();

      jsonData.forEach(file => {
        if (file.directory) file.open = false;
        file.depth = directoryData.depth + 1;
      });
      
      directoryData.open = true;

      // append children to data
      setData([
        ...data.slice(0, directoryIndex + 1),
        ...jsonData,
        ...data.slice(directoryIndex + 1)
      ]);
    })();
  };

  const closeDirectory = (directoryId) => {
    const directoryIndex = data.findIndex(file => file.id === directoryId);
    if (directoryIndex === -1) return;  

    const directoryData = data[directoryIndex];
    if (!directoryData.open) return;

    let lastChildIndex = data.length;
    for (let i = directoryIndex + 1; i < data.length; i++) {
      if (data[i].depth <= directoryData.depth) {
        lastChildIndex = i;
        break;
      }
    }

    directoryData.open = false;

    setData([
      ...data.slice(0, directoryIndex + 1),
      ...data.slice(lastChildIndex)
    ])
  };

  // load root dir initially
  useEffect(() => {
    if (!dataReady) return;

    (async () => {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/by-path?path=${root}`, { method: 'GET' });
      const directoryData = await res.json();
      directoryData.open = false;
      directoryData.depth = 0;
      setData([directoryData]);
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