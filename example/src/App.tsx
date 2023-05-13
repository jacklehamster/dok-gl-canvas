import React from 'react'
import TextureSample from './TextureSample';
import TriangleSample from './TriangleSample';
import { useState } from 'react';
import GridSample from './GridSample';

enum Sample {
  TEXTURE = "texture",
  TRIANGLE = "triangle",
  GRID = "grid",
}

export const App = () => {
  const [sample, setSample] = useState<string>(Sample.TEXTURE);
  return <>
    <select style={{ position: "sticky", top: 0 }} value={sample} onChange={({ target }) => setSample(target.value)}>
      <option value={Sample.TEXTURE}>texture sample</option>
      <option value={Sample.TRIANGLE}>triangle sample</option>
      <option value={Sample.GRID}>grid sample</option>
    </select>
    {sample === Sample.TEXTURE && <TextureSample />}
    {sample === Sample.TRIANGLE && <TriangleSample />}
    {sample === Sample.GRID && <GridSample />}
  </>
}

export default App
