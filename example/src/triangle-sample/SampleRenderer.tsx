import React, { useEffect, useState } from 'react'

import { GLCanvas } from 'dok-gl-canvas'
import { Assembler } from 'obj-assembler';

interface Props {
  assembler: Assembler;
  path: string;
}

function SampleRenderer({ assembler, path }: Props) {
  const [programs, setPrograms] = useState([]);
  const [scripts, setScripts] = useState([]);
  useEffect(() => {
    if (path) {
      assembler.load(path).then(result => {
        const { scripts, programs } = result;
        setPrograms(programs);
        setScripts(scripts);
      });  
    }
  }, [assembler, path]); 
  return <>{!scripts.length || !programs.length ? undefined :
    <GLCanvas key={path} scripts={scripts} programs={programs} /> 
  }</>;
}

export default SampleRenderer;