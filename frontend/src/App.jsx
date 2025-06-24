import { useEffect, useState } from 'react'
import './App.css'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import FileTable from './FileTable'
import TreeMap from './TreeMap'
import ExtensionInfo from './ExtensionInfo'

function App() {

  const [ directory, setDirectory ] = useState('');
  const [ scanning, setScanning ] = useState(false);
  const [ scanSuccess, setScanSuccess ] = useState(false);
  const [ treeMapComplete, setTreeMapComplete ] = useState(false);
  const [ selectedFile, setSelectedFile ] = useState(null);
  const [ selectedExtension, setSelectedExtension ] = useState(null);

  function handleTextFieldChange(e) {
    setDirectory(e.target.value);
  }

  async function handleClick(action) {
    if (action === 'delete') {
      await fetch(`${import.meta.env.VITE_APP_API_URL}/files`, { method: 'DELETE' });
    } else if (action === 'scan') {
      await fetch(`${import.meta.env.VITE_APP_API_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ directoryPath : directory })
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
          setScanSuccess(true);
        }
      }

    }, 500);

    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <Box sx={{height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
      <Box sx={{flex: '1', padding: '10px'}}>
        {scanSuccess && (
          <Box sx={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%'}}>
            <FileTable
              width={1400}
              dataReady={scanSuccess}
              root={directory}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
            <ExtensionInfo
              dataReady={scanSuccess}
              selectedExtension={selectedExtension}
              setSelectedExtension={setSelectedExtension}
              treeMapReady={treeMapComplete}
            />
          </Box>
        )}
        {!scanSuccess && (
          <div>
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
              <CircularProgress />
            )}
          </div>
        )}
      </Box>
      <Box sx={{flex: '1', padding: '10px'}}>
        <TreeMap
          root={directory}
          dataReady={scanSuccess}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          selectedExtension={selectedExtension}
          setTreeMapComplete={setTreeMapComplete}
        >
        </TreeMap>
      </Box>
    </Box>
  )
}

export default App
