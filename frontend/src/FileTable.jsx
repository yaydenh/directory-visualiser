
import React, { Profiler, useEffect, useRef, useState } from 'react';
import './FileTable.css'

import Box from '@mui/material/Box'
import { VariableSizeGrid  as Grid } from 'react-window'
import AutoSizer from "react-virtualized-auto-sizer";

import DirectoryButton from './DirectoryButton';

function FileTable({ dataReady, root, selectedFile, setSelectedFile }) {

  const [ columnWidths, setColumnWidths ] = useState([500, 150, 150, 150, 200, 200]);
  const columnMapping = ['path', 'size', 'numItems', 'numFiles', 'created', 'lastModified']

  const [ resizing, setResizing ] = useState({index: null, startX: 0, startWidth: 0});
  const [ data, setData ] = useState([]);
  const [ selectedIndex, setSelectedIndex ] = useState(null);
  const gridRef = useRef();

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

  // open selected files parent directories
  useEffect(() => {
    if (!selectedFile) return;
    
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/parents?id=${selectedFile}`, { method: 'GET' });
        const dirs = await res.json();
        
        let newData = data;
        for (const dir of dirs) {
          if (dir === selectedFile) break;
          newData = await openDirectory(dir, newData);
        }
        setData(newData);

        const selectedFileIndex = newData.findIndex(file => file.id === selectedFile);
        setSelectedIndex(selectedFileIndex);
      } catch (error) {
        console.error("Failed to get file parents: ", error);
      }
    })();

  }, [selectedFile]);

  // scroll to selected file
  useEffect(() => {
    if (selectedIndex) {
      gridRef?.current.scrollToItem({
        align: 'center',
        rowIndex: selectedIndex
      });
    }
  }, [selectedIndex]);

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
      if (resizing.index === null) return;

      // setTimeout because it causes rerenders and interferes with DirectoryButton
      setTimeout(() => {
        setResizing({index: null, startX: 0, startWidth: 0});
      }, 0);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'text';
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

    function handleClick() {
      // dont rerender when highlighting text
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;

      setSelectedFile(row.id);
    };

    const row = data[rowIndex];
    const column = columnMapping[columnIndex];

    let value = row[column];
    
    if (column === 'path') {
      value = value.split('/').pop();
    } else if (column === 'size') {
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let i = 0;

      while (value >= 1000 && i < units.length + 1) {
        value = value / 1000;
        i++;
      }

      value = Math.round(value * 10) / 10 + ' ' + units[i]; 
    } else if (column === 'created' || column === 'lastModified') {
      value = value.replace(/-/g, '/').replace('T', ' ').slice(0, 19);
    }

    const isSelected = row.id === selectedFile;
    const isDirectory = columnIndex === 0 && row.directory;
    const isFirstColumn = columnIndex === 0;
    const nextDepth = rowIndex + 1 === data.length ? 0 : data[rowIndex + 1].depth;
    const lastInDir = row.depth > nextDepth;

    const cellClass = `cell ${isSelected ? 'cell--selected' : ''}`

    return (
      <div
        className={cellClass}
        style={{...style, textAlign : isFirstColumn ? 'left' : 'right'}}
        onClick={handleClick}
      >
        {isFirstColumn && row.depth > 0 && (
          <>
            {Array.from({ length : row.depth }).map((_, i) => (
              <React.Fragment key={rowIndex + ':' + i}>
                {/* Vertical line under a directory */}
                <div
                  className='line-vertical'
                  style={{
                    left: 25 * i + 14,
                    height: (lastInDir && i >= nextDepth) ? '75%' : '100%',
                  }}
                />
                {/* Horizontal line marking end of directory */}
                {(lastInDir && i >= nextDepth) && (
                  <div
                    className='line-horizontal'
                    style={{
                      left: 25 * i + 15,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </>
        )}
        <div style={{ paddingLeft: isFirstColumn ? 25 * row.depth : 0 }}>
          {isDirectory && (
            <DirectoryButton
              directoryId={row.id}
              data={data}
              setData={setData}
              isOpen={row.open}
              openDirectory={openDirectory}
              closeDirectory={closeDirectory}
            />
          )}
          {value}
        </div>
      </div>
    );
  };

  return (
    <div className='filetable-container'>
      <Box display='column-heading-container'>
        {/* Column Headings */}
        {columnMapping.map((col, index) => (
          <div key={col} className='column-heading' style={{width: columnWidths[index], textAlign: index > 0 ? 'right' : 'left'}}>
            <span>{col.charAt(0).toUpperCase() + col.slice(1)}</span>
            {(index != columnMapping.length) && (
              <div
                className='column-resize-box'
                onMouseDown={e => {
                  setResizing({
                    index,
                    startX: e.clientX,
                    startWidth: columnWidths[index],
                  })
                }}
              >
                &#8942;
              </div>
            )}
          </div>
        ))}
      </Box>
      <Profiler id="Grid" onRender={(id, phase, actualDuration) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
      }}>
          <AutoSizer>
            {({ height, width }) => (
              <Grid
                ref={gridRef}
                width={width - 5}
                height={height - 35}
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
    </div>
  )
}

export default FileTable;