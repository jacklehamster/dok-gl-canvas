import React from 'react'
import SampleRenderer from './renderer/SampleRenderer';
import { useState } from 'react';
import { Assembler } from 'obj-assembler';

enum Sample {
  TRIANGLE = "triangle",
  TEXTURE = "texture",
  GRID = "grid",
  VIDEO = "video",
  INSTANCED = "instanced",
  INSTANCED_MOTION = "instanced-motion",
  ROTATION = "rotation",
  PERSPECTIVE = "perspective",
  INDEXED = "indexed",
  INDEXED_INSTANCED = "indexed-instances",
}

const assembler = new Assembler();

const samples: Record<string, React.JSX.Element> = {
  [Sample.TRIANGLE]: <SampleRenderer assembler={assembler} path="resources/triangle-sample/triangle-sample.yml" />,
  [Sample.TEXTURE]: <SampleRenderer assembler={assembler} path="resources/texture-sample/texture-sample.yml" />,
  [Sample.GRID]: <SampleRenderer assembler={assembler} path="resources/grid-sample/grid-sample.yml" />,
  [Sample.VIDEO]: <SampleRenderer assembler={assembler} path="resources/video-sample/video-sample.yml" />,
  [Sample.INSTANCED]: <SampleRenderer assembler={assembler} path="resources/triangle-instance-sample/triangle-instance-sample.yml" />,
  [Sample.INSTANCED_MOTION]: <SampleRenderer assembler={assembler} path="resources/triangle-motion/triangle-motion.yml" />,
  [Sample.ROTATION]: <SampleRenderer assembler={assembler} path="resources/rotation-sample/rotation.yml" />,
  [Sample.PERSPECTIVE]: <SampleRenderer assembler={assembler} path="resources/perspective-sample/perspective.yml" />,
  [Sample.INDEXED]: <SampleRenderer assembler={assembler} path="resources/indexed-element-sample/indexed.yml" />,
  [Sample.INDEXED_INSTANCED]: <SampleRenderer assembler={assembler} path="resources/indexed-instances-sample/indexed.yml" />,
};

export const App = () => {
  const [sample, setSample] = useState<string>(Sample.TRIANGLE);
  return <>
    <select id="sample" style={{ position: "sticky", top: 0 }} value={sample} onChange={({ target }) => setSample(target.value)}>
      {Object.keys(samples).map((type, index) => <option key={type} value={type}>{index+1} - {type} sample</option>)}
    </select>
    {samples[sample]}
  </>
}

export default App;
