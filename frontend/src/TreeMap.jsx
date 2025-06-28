
import { useEffect, useRef, useState } from "react";
import './TreeMap.css';
import LinearProgress from "@mui/material/LinearProgress";

function TreeMap({ root, treeMapReady, setTreeMapReady, selectedFile, setSelectedFile, selectedExtension }) {

  const [ treeMapProcessing, setTreeMapProcessing ] = useState(false);
  
  const [ rgbGrid, setRgbGrid ] = useState(null);
  const ref = useRef();
  const [ height, setHeight ] = useState();
  const [ width, setWidth ] = useState();

  const [ hoverPath, setHoverPath ] = useState(null);

  useEffect(() => {
    // calc height for canvas size
    setWidth(ref?.current?.offsetWidth);
    setHeight(ref?.current?.offsetHeight);

    if (treeMapReady) return;

    const canvas = document.getElementById('fileHighlight');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // start generating treemap
    (async () => {
      try {
        if (rgbGrid === null) {
          await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/start?root=${root}&height=${ref?.current?.offsetHeight}&width=${ref?.current?.offsetWidth}`, { method: 'POST' });
        } else {
          await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/zoom?root=${root}&height=${ref?.current?.offsetHeight}&width=${ref?.current?.offsetWidth}`, { method: 'POST' });
        }
        setTreeMapProcessing(true);
        setTreeMapReady(false);
      } catch (error) {
        console.error("Failed to generate treemap: ", err);
      }
    })();
  }, [treeMapReady, root]);

  // check when tree map is finished processing
  useEffect(() => {
    if (!treeMapProcessing) return;

    const interval = setInterval(async () => {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/status`, { method: 'GET' });
      const data = await res.json();
      console.log(data);
      if (!data.processing) {
        setTreeMapProcessing(false);
        if (!data.hasError) {
          setTreeMapReady(true);
        }
        clearInterval(interval);
      }

      const gridRes = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/colours`, { method: 'GET' });
      const gridData = await gridRes.json();
      setRgbGrid(gridData);
    }, 500);

    return () => clearInterval(interval);
  }, [treeMapProcessing]);

  // get treemap
  useEffect(() => {
    if (!treeMapReady) return;

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/colours`, { method: 'GET' });
        const data = await res.json();
        setRgbGrid(data);
      } catch (error) {
        console.error("Failed to fetch treemap: ", err);
      }
    })();
  }, [treeMapReady]);

  // select file when clicking
  async function handleClick(e) {
    if (!treeMapReady) return;

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
  };

  // show path of hovered file
  async function handleMouseMove(e) {
    if (!treeMapReady) return;

    const canvas = document.getElementById('fileHighlight');
    const rect = canvas.getBoundingClientRect();

    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    
    try {
      const resId = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/lookup?x=${x}&y=${y}`, { method: 'GET' });
      const fileId = await resId.json();
      
      const resFile = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/${fileId}`, { method: 'GET' });
      const fileData = await resFile.json();

      setHoverPath(fileData.path);

    } catch (error) {
      console.error("Failed to fetch rectangle's file path:", error);
    }
  };

  // highlight selected file on treemap
  useEffect(() => {
    if (!selectedFile || !treeMapReady) return;

    const canvas = document.getElementById('fileHighlight');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, width, height);

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/bounds/file?fileId=${selectedFile}`, { method: 'GET' });
        const data = await res.json();

        ctx.beginPath();
        ctx.lineWidth = '5';
        ctx.strokeStyle = 'white';
        ctx.rect(data.x, data.y, data.width, data.height);
        ctx.stroke();
      } catch (error) {
        console.error("Failed to fetch file bounds: ", error);
      }
    })();
  }, [selectedFile, treeMapReady]);

  // highlight selected extension
  useEffect(() => {
    if (!selectedExtension || !treeMapReady) return;

    const canvas = document.getElementById('fileHighlight');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, width, height);

    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/treemap/bounds/extension?extension=${selectedExtension}`, { method: 'GET' });
        const data = await res.json();

        ctx.lineWidth = '2';
        ctx.strokeStyle = 'white';

        data.forEach((rect) => {
          ctx.beginPath();
          ctx.rect(rect.x, rect.y, rect.width, rect.height);
          ctx.stroke();
        });

      } catch (error) {
        console.error("Failed to fetch extension bounds: ", error);
      }
    })();

  }, [selectedExtension])

  // render treemap on canvas
  useEffect(() => {
    if (rgbGrid === null) return;

    const canvas = document.getElementById("treeMap");
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = i * width + j;
        const colour = rgbGrid[index] || 0;

        pixels[index * 4 + 0] = (colour >> 24) & 0xff;  //r
        pixels[index * 4 + 1] = (colour >> 16) & 0xff;  //g
        pixels[index * 4 + 2] = (colour >> 8) & 0xff;   //b
        pixels[index * 4 + 3] = (colour >> 0) & 0xff;   //alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [rgbGrid]);

  return (
    <div className='treemap-container'>
      <div className='hover-path'>{hoverPath}</div>
      <div ref={ref} className = 'canvas-wrapper'>
        {treeMapProcessing && (<LinearProgress sx={{height: 10}}/>)}
        <canvas
          id='treeMap'
          width={width}
          height={height}
          className='canvas-layer canvas-base'>
        </canvas>
        <canvas
          id='fileHighlight'
          width={width}
          height={height}
          className='canvas-layer canvas-overlay'
          onClick={handleClick}
          onMouseMove={handleMouseMove}
        ></canvas>
      </div>
    </div>
  );
}

export default TreeMap;