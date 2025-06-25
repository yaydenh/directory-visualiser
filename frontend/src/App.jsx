import { useEffect, useState } from 'react'
import './App.css'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import FileTable from './FileTable'
import TreeMap from './TreeMap'
import ExtensionInfo from './ExtensionInfo'
import ControlPanel from './ControlPanel'

function App() {

  const [ root, setRoot ] = useState(null);
  const [ rootPath, setRootPath ] = useState('');
  const [ scanning, setScanning ] = useState(false);
  const [ scanSuccess, setScanSuccess ] = useState(false);
  const [ treeMapReady, setTreeMapReady ] = useState(false);

  const [ selectedFile, setSelectedFile ] = useState(null);
  const [ selectedExtension, setSelectedExtension ] = useState(null);
  const [ zoomDirectory, setZoomDirectory ] = useState(null);

  function handleTextFieldChange(e) {
    setRootPath(e.target.value);
  }

  async function handleClick(action) {
    if (action === 'delete') {
      await fetch(`${import.meta.env.VITE_APP_API_URL}/files`, { method: 'DELETE' });
    } else if (action === 'scan') {
      await fetch(`${import.meta.env.VITE_APP_API_URL}/files`, { method: 'DELETE' });
      await fetch(`${import.meta.env.VITE_APP_API_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ directoryPath : rootPath })
      });
      setScanSuccess(false);
      setScanning(true);
    }
  }

  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(async () => {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/scan/status`, { method: 'GET' });
      const data = await res.json();

      if (!data.inProgress || data.hasError) {
        setScanning(false);
        clearInterval(interval);
        if (!data.hasError) {
          const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/by-path?path=${rootPath}`, { method: 'GET' });
          const data = await res.json();
          setRoot(data.id);
          setZoomDirectory(data.id);
          setScanSuccess(true);
        }
      }

    }, 500);

    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <div className='screen'>
      {!scanSuccess ? (
        <div className='input-container'>
          <p style={{fontWeight: 500}}>Please input directory path:</p>
          <TextField label='Directory Path' variant='outlined' onChange={handleTextFieldChange}/>
          <Box m={2}>
            <Button variant='outlined' onClick={() => handleClick('scan')} size='small'>
              Scan Directory
            </Button>
          </Box>
          <Box m={2}>
            <Button variant='outlined' onClick={() => handleClick('delete')} size='small'>
              Clear Database
            </Button>
          </Box>
          {scanning && (
            <CircularProgress sx={{position: 'absolute'}}/>
          )}
        </div>
      ) : (
        <>
          <div className='top-half'>
              <FileTable
                root={root}
                width={1400}
                dataReady={scanSuccess}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                zoomDirectory={zoomDirectory}
              />
              <ExtensionInfo
                dataReady={scanSuccess}
                selectedExtension={selectedExtension}
                setSelectedExtension={setSelectedExtension}
                treeMapReady={treeMapReady}
              />
          </div>
          <div className='controls-box'>
            <ControlPanel
              root={root}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              treeMapReady={treeMapReady}
              setTreeMapReady={setTreeMapReady}
              zoomDirectory={zoomDirectory}
              setZoomDirectory={setZoomDirectory}
            />
          </div>
          <div className='bottom-half'>
            <TreeMap
              root={zoomDirectory}
              treeMapReady={treeMapReady}
              setTreeMapReady={setTreeMapReady}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              selectedExtension={selectedExtension}
            >
            </TreeMap>
          </div>
        </>
      )}
    </div>
  )
}

export default App
