import { useState } from 'react'
import './App.css'
import Button from './components/Button'

function App() {

  function handleClick() {
    fetch(`${import.meta.env.VITE_APP_API_URL}/files`, { method: "DELETE" });
  }

  return (
    <>
      <p>Please input directory absolute path:</p>
      <Button/>
      <br/>
      <input type='button' value="Clear Database" onClick={handleClick}></input>
    </>
  )
}

export default App
