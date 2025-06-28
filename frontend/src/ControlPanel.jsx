
import './ControlPanel.css'
import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import RefreshIcon from '@mui/icons-material/Refresh';

function ControlPanel({ root, selectedFile, setSelectedFile, treeMapReady, setTreeMapReady, zoomDirectory, setZoomDirectory }) {

  const [ parentIds, setParentIds ] = useState(null);
  const [ selectedIsDir, setSelectedIsDir ] = useState();

  // get selected file's parent id
  useEffect(() => {
    if (selectedFile === null) {
      setParentIds(null);
      return;
    }
    
    (async () => {
      try {
        const parentsRes = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/parents?id=${selectedFile}`, { method: 'GET' });
        const parentIdsData = await parentsRes.json();

        const selectedRes = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/${selectedFile}`, { method: 'GET' });
        const selectedFileData = await selectedRes.json();
        if (selectedFileData.directory) parentIdsData.push(selectedFile);
        setSelectedIsDir(selectedFileData.directory);

        if (parentIdsData.length > 0) {
          setParentIds(parentIdsData);
        } else {
          setParentIds(null);
        }

      } catch (error) {
        console.error("Failed to get parents: ", error);
      }
    })();
  }, [selectedFile]);

  function handleClickSelectParent() {
    if (selectedIsDir) {
      setSelectedFile(parentIds[parentIds.length - 2]);
    } else {
      setSelectedFile(parentIds[parentIds.length - 1]);
    }
  }

  function handleClickRemakeTreeMap() {
    setTreeMapReady(false);
  }

  async function handleClickZoom(action) {
    if (action === 'reset') {
      setZoomDirectory(root);
      return;
    }
    if (action === 'selected') {
      setZoomDirectory(selectedFile);
      return;
    }

    try {
      const currZoomIndex = parentIds.indexOf(zoomDirectory);
      if (currZoomIndex === -1) return;

      let nextZoomIndex = currZoomIndex;
      if (action === 'in') nextZoomIndex++;
      if (action === 'out') nextZoomIndex--;

      if (nextZoomIndex < 0 || nextZoomIndex >= parentIds.length) return;

      setZoomDirectory(parentIds[nextZoomIndex]);

    } catch (error) {
      console.error("Failed to zoom in:", error);
    }
  }


  return (
    <div className='controls-container'>
      <Button 
        disabled={parentIds === null || selectedFile === root}
        onClick={handleClickSelectParent}
      >
        Select Parent
      </Button>
      <Button 
        disabled={!treeMapReady}
        onClick={handleClickRemakeTreeMap}
      >
        Remake Treemap
        <RefreshIcon/>
      </Button>
      <Button 
        disabled={!treeMapReady}
        onClick={() => handleClickZoom('in')}
      >
        Zoom In
        <ZoomInIcon/>
      </Button>
      <Button 
        disabled={!treeMapReady}
        onClick={() => handleClickZoom('out')}
      >
        Zoom Out
        <ZoomOutIcon/>
      </Button>
      <Button 
        disabled={!selectedIsDir}
        onClick={() => handleClickZoom('selected')}
      >
        Zoom To Selected
        <ZoomOutIcon/>
      </Button>
      <Button 
        disabled={!treeMapReady}
        onClick={() => handleClickZoom('reset')}
      >
        Reset Zoom
        <FindReplaceIcon/>
      </Button>
    </div>
  )
}

export default ControlPanel;