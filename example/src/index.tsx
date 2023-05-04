import './index.css'

import React from 'react'
import * as ReactDOMClient from "react-dom/client";
import App from './App'

const hudRoot = ReactDOMClient.createRoot(document.getElementById('root')!);

hudRoot.render(<App />)
