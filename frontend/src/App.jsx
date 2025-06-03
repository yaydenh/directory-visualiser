import { useEffect, useState } from 'react'
import './App.css'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

function App() {

  const [ directory, setDirectory ] = useState("");
  const [ scanning, setScanning ] = useState(false);

  function handleTextFieldChange(e) {
    setDirectory(e.target.value);
  }

  function handleClick(action) {
    if (action === 'delete') {
      fetch(`${import.meta.env.VITE_APP_API_URL}/files`, { method: 'DELETE' });

    } else if (action === 'scan') {
      fetch(`${import.meta.env.VITE_APP_API_URL}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ directoryPath : directory})
      })
      .then(() => setScanning(true));
    }
  }

  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(() => {
      fetch(`${import.meta.env.VITE_APP_API_URL}/scan/progress`, { method: 'GET' })
      .then(res => res.json())
      .then(scanInProgress => {
        if (!scanInProgress) {
          setScanning(false);
          clearInterval(interval);
        }
      })
    }, 500);

    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <>
      <p>Please input directory path:</p>
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
    </>
  )
}

export default App
