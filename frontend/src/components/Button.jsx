import { useState } from "react";

function Button() {
  const [ dirPath, setDirPath ] = useState("");

  function handleClick() {
    fetch("http://localhost:8080/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ directoryPath : {dirPath}})
    })
    .then(res => res.text())
    .then(data => console.log(data));
  }

  return (
    <>
      <input type="text" id="path" onChange={e => setDirPath(e.value)}/>
      <br/>
      <input type="button" value="Scan Directory" onClick={handleClick} />
    </>
  )
}

export default Button