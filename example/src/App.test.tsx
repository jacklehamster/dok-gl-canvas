import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as ReactDOMClient from "react-dom/client";

it('renders without crashing', () => {
  const div = document.createElement('div')
  const hudRoot = ReactDOMClient.createRoot(div!);
  
  hudRoot.render(<App />)
  ReactDOM.unmountComponentAtNode(div)
})
