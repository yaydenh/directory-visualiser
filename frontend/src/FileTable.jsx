
import { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box'
import { VariableSizeGrid  as Grid } from 'react-window'
import AutoSizer from "react-virtualized-auto-sizer";

import DirectoryButton from './DirectoryButton';

function FileTable({ dataReady, root }) {

  const [ columnWidths, setColumnWidths ] = useState([500, 100, 100, 100, 200, 200]);
  const [ resizing, setResizing ] = useState({index: null, startX: 0, startWidth: 0});
  const [ data, setData ] = useState([]);
  const gridRef = useRef();
  const columnMapping = ['path', 'directory', 'size', 'extension', 'created', 'lastModified']

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

  // resizing column widths by dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (resizing.index === null) return;

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';  // prevent highlighting text

      const deltaX = e.clientX - resizing.startX;
      setColumnWidths(prevWidths => {
        const newWidths = [...prevWidths];
        newWidths[resizing.index] = Math.max(100, resizing.startWidth + deltaX);
        return newWidths;
      })
    };

    const handleMouseUp = () => {
      // setTimeout because it causes rerenders and interferes with DirectoryButton
      setTimeout(() => {
        setResizing({index: null, startX: 0, startWidth: 0});
      }, 0);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [resizing]);

  // rerender react-window after resizing columns
  useEffect(() => {
    gridRef.current?.resetAfterColumnIndex(0);
  }, [columnWidths]);

  const Cell = ({ rowIndex, columnIndex, style }) => {

    const row = data[rowIndex];
    const column = columnMapping[columnIndex];

    let value = row[column];
    if (column === 'directory') {
      value = value ? "Yes" : "No"
    } else if (column === 'path') {
      value = value.split('/').pop();
    }

    const isDirectory = columnIndex === 0 && row.directory;

    return (
    <Box sx={{ ...style, color: 'black', textAlign: 'left', }}>
      <Box
        sx={{
          paddingLeft: (columnIndex === 0) * 3 * row.depth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {isDirectory && (
          <DirectoryButton directoryId={row.id} isOpen={row.open} openDirectory={openDirectory} closeDirectory={closeDirectory} />
        )}
        {value}
      </Box>
    </Box>
    );
  };

  return (
    <Box display={'flex'} flexDirection={'column'} sx={{ width: '100%', height: '100%', bgcolor: 'lightgrey'}}>
      <Box display={'flex'} textAlign={'left'} color={'blue'}>
        {columnMapping.map((col, index) => (
          <Box key={col} sx={{width: columnWidths[index], height: '20px', position: 'relative' }}>
            <span>{col}</span>
            {(index != columnMapping.length - 1) && (
              <Box
                sx={{
                  width: 5,
                  height: '100%',
                  position: 'absolute',
                  right: '5px',
                  top: 0,
                  color: 'gray',
                  cursor: 'col-resize',
                }}
                onMouseDown={e => {
                  setResizing({
                    index,
                    startX: e.clientX,
                    startWidth: columnWidths[index],
                  })
                }}
              >
                &#8942;
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            ref={gridRef}
            width={width}
            height={height - 20}
            columnCount={6}
            columnWidth={index => columnWidths[index]}
            rowCount={data.length}
            rowHeight={() => 20}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </Box>
  )
}

export default FileTable;