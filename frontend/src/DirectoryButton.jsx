
import { useEffect, useState } from "react";

import IconButton from "@mui/material/IconButton";
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

function DirectoryButton({ directoryId, isOpen, openDirectory, closeDirectory }) {

  function handleClick() {
    if (!isOpen) openDirectory(directoryId);
    else closeDirectory(directoryId);
  }

  return (
    <IconButton 
      onClick={handleClick} 
      size='small'
      sx={{ 
        width: '30px',
        height: '30px',
        '&:focus': { outline: 'none' },
        '&:focus-visible': { outline: 'none' },
      }}
    >
      {isOpen ? <FolderOpenIcon /> : <FolderIcon />}
    </IconButton>
  );
}

export default DirectoryButton;