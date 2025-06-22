import { useEffect, useRef, useState } from 'react';
import './ExtensionInfo.css'
import './FileTable.css'

import { VariableSizeGrid  as Grid } from 'react-window'
import AutoSizer from "react-virtualized-auto-sizer";

function ExtensionInfo({ dataReady }) {

  const [ columnWidths, setColumnWidths ] = useState([ 100, 100, 80 ]);
  const [ resizing, setResizing ] = useState({index: null, startX: 0, startWidth: 0});
  const columnMapping = ['extension', 'count', 'colour'];
  const headingRef = useRef();

  const [ data, setData ] = useState([]);
  const gridRef = useRef();

  useEffect(() => {
    if (!dataReady) return;

    (async () => {
      try {
        setTimeout(async () => {
        const dataRes = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/extensions`, { method: 'GET' });
        const extensionsData = await dataRes.json();

        const colourRes = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/colours/extension`, { method: 'GET' });
        const colourData = await colourRes.json();

        console.log(colourData);  

        extensionsData.forEach((row) => {
          row.colour = colourData[row.extension];
        });

        setData(extensionsData);
        }, 5000);

      } catch (error) {

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
        newWidths[resizing.index] = Math.max(80, resizing.startWidth + deltaX);
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

  // rerender grid when resizing
  useEffect(() => {
    gridRef.current?.resetAfterColumnIndex(0);
  }, [columnWidths]);

  const Cell = ({ rowIndex, columnIndex, style }) => {

    const extensionData = data[rowIndex];
    const column = columnMapping[columnIndex];

    let value = extensionData[column];

    const isColourCol = column === 'colour';
    
    const backgroundColor = isColourCol && true
      ? `rgb(${(value >> 16) & 0xff}, ${(value >> 8) & 0xff}, ${value & 0xff})`
      : 'lightgray';

    if (isColourCol) value = '';

    const className = isColourCol ? 'colour-cell' : '';

    return (
      <div className={className} style={{...style, backgroundColor }}>
        {value}
      </div>
    );
  };

  return (
    <div className='extension-info-container'>
      <div ref={headingRef} className='column-heading-container'>
        {/* Column Headings */}
        {columnMapping.map((col, index) => (
          <div key={col} className='column-heading' style={{width: columnWidths[index]}}>
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
      </div>
      <AutoSizer>
        {({height, width}) => (
          <Grid                
            ref={gridRef}
            width={width - 5}
            height={height - 35}
            columnCount={columnMapping.length}
            columnWidth={index => columnWidths[index]}
            rowCount={data.length}
            rowHeight={() => 20}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>

    </div>
  );
}

export default ExtensionInfo;