
import { useEffect, useState } from "react";

import IconButton from "@mui/material/IconButton";
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';

function DirectoryButton({ directoryId, data, setData, isOpen, isZoomed, openDirectory, closeDirectory }) {

  const icon = () => {
    if (isZoomed) return <FolderSpecialIcon/>;
    return isOpen ? <FolderOpenIcon /> : <FolderIcon />;
  }

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
      {icon()}
    </IconButton>
  );
}

export default DirectoryButton;