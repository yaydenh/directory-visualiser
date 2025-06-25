import Button from '@mui/material/Button';
import './ControlPanel.css'
import { useEffect, useState } from 'react';

function ControlPanel({ selectedFile, setSelectedFile }) {

  const [ parentId, setParentId ] = useState(null);

  // get selected file's parent id
  useEffect(() => {
    if (selectedFile === null) {
      setParentId(null);
      return;
    }
    
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/files/parents?id=${selectedFile}`, { method: 'GET' });
        const parentIds = await res.json();

        if (parentIds.length > 0) {
          setParentId(parentIds[parentIds.length - 1]);
        } else {
          setParentId(null);
        }

      } catch (error) {
        console.error("Failed to get parent: ", error);
      }
    })();

  }, [selectedFile]);

  async function handleClickSelectParent() {
    setSelectedFile(parentId);
  }

  return (
    <div className='controls-container'>
      <Button 
        disabled={parentId === null}
        onClick={handleClickSelectParent}
      >
        Select Parent
      </Button>
    </div>
  )
}

export default ControlPanel;