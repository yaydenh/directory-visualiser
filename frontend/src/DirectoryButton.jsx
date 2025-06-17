
import { useEffect, useState } from "react";

import IconButton from "@mui/material/IconButton";
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

function DirectoryButton({ directoryId, data, setData, isOpen, openDirectory, closeDirectory }) {

  async function handleClick(e) {
    e.stopPropagation();
    if (!isOpen) {
      const newData = await openDirectory(directoryId, data);
      setData(newData);
    } else {
      const newData = closeDirectory(directoryId, data);
      setData(newData);
    }
  }

  return (
    <IconButton 
      onClick={handleClick} 
      size='small'
      sx={{ 
        width: '30px',
        height: '20px',
        '&:focus': { outline: 'none' },
        '&:focus-visible': { outline: 'none' },
        position: 'relative',
        top: '-3px'
      }}
    >
      {isOpen ? <FolderOpenIcon /> : <FolderIcon />}
    </IconButton>
  );
}

export default DirectoryButton;