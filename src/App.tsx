import React, { useState } from "react";
// import "@fluentui/react";
import { Pivot, PivotItem } from "./Pivot";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Pivot>
        <PivotItem headerText="Item 1">hello</PivotItem>
        <PivotItem headerText="Item 2">hello</PivotItem>
        <PivotItem headerText="Item 3">hello</PivotItem>
      </Pivot>
    </div>
  );
}

export default App;
