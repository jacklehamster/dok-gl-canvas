import React, { useEffect, useState } from 'react'

import { GLCanvas } from 'dok-gl-canvas'
import { Assembler } from 'obj-assembler';
import { GlAction, Script } from 'dok-gl-actions';
import { ProgramConfig } from 'dok-gl-actions/dist/program/program';

interface Props {
  assembler: Assembler;
  path: string;
}


interface CanvasConfig {
  path: string;
  programs: ProgramConfig[];
  scripts: Script<GlAction>[];
}

function SampleRenderer({ assembler, path }: Props) {
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>();
  useEffect(() => {
    if (path) {
      assembler.load(path).then(result => {
        const { scripts, programs } = result;
        setCanvasConfig({
          path,
          programs,
          scripts,
        });
      });  
    }
  }, [assembler, path]); 
  return <>{!canvasConfig ? undefined :
    <GLCanvas key={canvasConfig.path} scripts={canvasConfig.scripts} programs={canvasConfig.programs} /> 
  }</>;
}

export default SampleRenderer;