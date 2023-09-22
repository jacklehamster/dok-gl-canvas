# dok-gl-canvas

## Overview

This project uses a new programming language (let's call it NAPL.alpha), which uses serializable code, to process and display WebGL demos.
The idea of this new language is to make code easy to configure, as it's just a serialized object that can be manipulated at runtime.

## Demo

https://jacklehamster.github.io/dok-gl-canvas/example/build

[Sep. 23, 2023]
## Project scrapped

This project has some good elements, but I need to scrap it and redo it again.

### Reasons
- It has some design flaws, especially around asynchronous image loading. (completely fork'd once I try to load multiple images)
- I'm moving all my projects to Bun.js. See https://dev.to/jacklehamster/im-going-all-in-on-bunjs-3ljk
- The JS code is pretty ugly and hard to understand.
- The NAPL code is not that easy to use.

### Learnings
- Make sure the asynchronous flow is nailed.
- Simplify coding.

### Progress
- I've already started https://github.com/jacklehamster/dok-engine, where I started simplifying the NAPL code, but that one is going to be scrapped next in favor of https://github.com/jacklehamster/bun-engine, where I will first try to solve the graphics engine before trying to establish the NAPL language.




--------
> Made with create-react-library

[![NPM](https://img.shields.io/npm/v/dok-lib.svg)](https://www.npmjs.com/package/dok-lib) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save dok-lib
```

## Usage

```tsx
import React, { Component } from 'react'

import MyComponent from 'dok-lib'
import 'dok-lib/dist/index.css'

class Example extends Component {
  render() {
    return <MyComponent />
  }
}
```

## License

MIT © [jacklehamster](https://github.com/jacklehamster)

