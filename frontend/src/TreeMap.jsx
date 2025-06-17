import Box from "@mui/material/Box";
import { createContext, useEffect, useRef, useState } from "react";


function TreeMap({ root, dataReady, selectedFile, setSelectedFile }) {

  const [ rgbGrid, setRgbGrid ] = useState([]);
  const ref = useRef();
  const [ height, setHeight ] = useState();
  const [ width, setWidth ] = useState();

  useEffect(() => {
    setWidth(ref?.current?.offsetWidth);
    setHeight(ref?.current?.offsetHeight);
  }, []);

  // get treemap
  useEffect(() => {
    if (!dataReady) return;

    (async () => {
      try {
        await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/generate?root=${root}&height=${height}&width=${width}`, { method: 'GET' });
        setTimeout(() => {}, 5000);
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/colours`, { method: 'GET' });
        const data = await res.json();
        setRgbGrid(data);
      } catch (error) {
        console.error("Failed to fetch treemap: ", err);
      }

    })();

  }, [dataReady]);

  // select file when clicking
  async function handleClick(e) {
    const canvas = document.getElementById('fileHighlight');
    const rect = canvas.getBoundingClientRect();

    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top); 

    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/lookup?x=${x}&y=${y}`, { method: 'GET' });
      const fileId = await res.json();
      // set null to cause rerenders when selecting same id
      setSelectedFile(null);
      setTimeout(() => setSelectedFile(fileId), 1);
    } catch (error) {
      console.error("Failed to fetch rectangle's file:", error);
    }
  }

  // highlight selected file on treemap
  useEffect(() => {
    if (!selectedFile) return;

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/${selectedFile}`, { method: 'GET' });
        const data = await res.json();

        const canvas = document.getElementById('fileHighlight');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.lineWidth = '5';
        ctx.strokeStyle = 'white';
        ctx.rect(data.x, data.y, data.width, data.height);
        ctx.stroke();
      } catch (error) {
        console.error("Failed to fetch file bounds: ", error);
      }
    })();
  }, [selectedFile]);

  // render treemap on canvas
  useEffect(() => {
    if (rgbGrid.length === 0) return;

    const canvas = document.getElementById("treeMap");
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = i * width + j;
        const colour = rgbGrid[index] || 0;

        pixels[index * 4 + 0] = (colour >> 16) & 0xff;    //r
        pixels[index * 4 + 1] = (colour >> 8) & 0xff; //g
        pixels[index * 4 + 2] = (colour) & 0xff;      //b
        pixels[index * 4 + 3] = 255;                  //alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [rgbGrid]);

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        height: '100%',
        bgcolor: 'lightgrey'
      }}
    >
      <canvas id='treeMap' width={width} height={height}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      >
      </canvas>
      <canvas id='fileHighlight' width={width} height={height}
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
      </canvas>
    </Box>
  );

}

export default TreeMap;