
import { Profiler, useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box'
import { VariableSizeGrid  as Grid } from 'react-window'
import AutoSizer from "react-virtualized-auto-sizer";

import DirectoryButton from './DirectoryButton';

function FileTable({ dataReady, root, selectedFile, setSelectedFile }) {

  const [ columnWidths, setColumnWidths ] = useState([500, 100, 100, 100, 200, 200]);
  const [ resizing, setResizing ] = useState({index: null, startX: 0, startWidth: 0});
  const [ data, setData ] = useState([]);
  const gridRef = useRef();
  const columnMapping = ['path', 'directory', 'size', 'extension', 'created', 'lastModified']

  const openDirectory = async (directoryId, currData) => {
    const directoryIndex = currData.findIndex(file => file.id === directoryId);
    if (directoryIndex === -1) return currData;  

    const directoryData = currData[directoryIndex];
    if (directoryData.open) return currData;

    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/files?directory=${directoryData.path}`, { method: 'GET' });
      const childrenData = await res.json();

      const updatedData = [...currData];
      updatedData[directoryIndex] = { ...directoryData, open: true};

      if (childrenData.length === 0) return updatedData;

      childrenData.forEach(file => {
        if (file.directory) file.open = false;
        file.depth = directoryData.depth + 1;
      });

      return [
        ...updatedData.slice(0, directoryIndex + 1),
        ...childrenData,
        ...updatedData.slice(directoryIndex + 1)
      ];
    } catch (error) {
      console.error('Failed to open directory:', error);
    }

    return currData;
  };

  const closeDirectory = (directoryId, currData) => {
    const directoryIndex = data.findIndex(file => file.id === directoryId);
    if (directoryIndex === -1) return currData;  

    const directoryData = data[directoryIndex];
    if (!directoryData.open) return currData;

    const lastChildIndex = data.findIndex((file, i) => 
      i > directoryIndex && file.depth <= directoryData.depth
    );

    const endIndex = lastChildIndex === -1 ? data.length : lastChildIndex;

    const updatedData = [
      ...data.slice(0, directoryIndex),
      {...directoryData, open: false},
      ...data.slice(endIndex)
    ];

    return updatedData;
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

  // scroll grid to selected file
  useEffect(() => {
    console.log(selectedFile);
    if (!selectedFile) return;
    
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/parents?id=${selectedFile}`, { method: 'GET' });
        const dirs = await res.json();
        
        let newData = data;
        for (const dir of dirs) {
          newData = await openDirectory(dir, newData);
        }
        setData(newData);
      } catch (error) {
        console.error("Failed to get file parents: ", error);
      }
    })();

  }, [selectedFile]);

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

    const isSelected = row.id === selectedFile;
    const isDirectory = columnIndex === 0 && row.directory;

    return (
      <div
        style={{
          ...style,
          color: 'black',
          textAlign: 'left',
          backgroundColor: isSelected ? 'lightblue' : 'transparent',
        }}
        onClick={() => setSelectedFile(row.id)}
      >
        <div
          style={{
            paddingLeft: (columnIndex === 0) * 25 * row.depth,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {isDirectory && (
            <DirectoryButton directoryId={row.id} data={data} setData={setData} isOpen={row.open} openDirectory={openDirectory} closeDirectory={closeDirectory} />
          )}
          {value}
        </div>
      </div>
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
      <Profiler id="Grid" onRender={(id, phase, actualDuration) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
      }}>
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
        </Profiler>
    </Box>
  )
}

export default FileTable;