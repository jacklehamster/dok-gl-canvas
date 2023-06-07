import React from 'react'
import TextureSample from './TextureSample';
import TriangleSample from './TriangleSample';
import { useState } from 'react';
import GridSample from './GridSample';
import VideoSample from './VideoSample';
import TriangleInstancedSample from './TriangleInstancedSample';
import InstancedMotionSample from "./InstanceMotionSample";

enum Sample {
  TEXTURE = "texture",
  TRIANGLE = "triangle",
  GRID = "grid",
  VIDEO = "video",
  INSTANCED = "instanced",
  INSTANED_MOTION = "instanced-motion",
}

const samples: Record<string, React.JSX.Element> = {
  [Sample.TEXTURE]: <TextureSample />,
  [Sample.TRIANGLE]: <TriangleSample />,
  [Sample.GRID]: <GridSample />,
  [Sample.VIDEO]: <VideoSample />,
  [Sample.INSTANCED]: <TriangleInstancedSample />,
  [Sample.INSTANED_MOTION]: <InstancedMotionSample />,
};

export const App = () => {
  const [sample, setSample] = useState<string>(Sample.TEXTURE);
  return <>
    <select id="sample" style={{ position: "sticky", top: 0 }} value={sample} onChange={({ target }) => setSample(target.value)}>
      {Object.keys(samples).map(type => <option key={type} value={type}>{type} sample</option>)}
    </select>
    {samples[sample]}
  </>
}

export default App
