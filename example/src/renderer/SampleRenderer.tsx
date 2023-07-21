import React, { useEffect, useState } from 'react'

import { GLCanvas } from 'dok-gl-canvas'
import { Assembler } from 'obj-assembler';
import { GlAction, Script } from 'dok-gl-actions';
import { ProgramConfig } from 'dok-gl-actions/dist/program/program';
import { DokEditor } from 'dok-editor';
import { stringify, parse } from 'yaml';

interface Props {
  assembler: Assembler;
  path: string;
}


interface CanvasConfig {
  path: string;
  programs: ProgramConfig[];
  scripts: Script<GlAction>[];
}

declare global {
  interface Window { controller: any; }
}
window.controller = {};

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
    <div style={{ display: "flex", flexDirection: "row", height: "100%", width: "100%" }}>
      <div style={{ width: "50%", height: "100%" }}>
        <GLCanvas key={canvasConfig.path} scripts={canvasConfig.scripts} programs={canvasConfig.programs} controller={window.controller} />
      </div>
      <div style={{ width: "50%" }}>
        <DokEditor code={stringify({
              programs: canvasConfig.programs,
              scripts: canvasConfig.scripts,
          })} onCodeChange={code => {
              const config = parse(code);
              setCanvasConfig({
                path,
                programs: config.programs,
                scripts: config.scripts,
              });
          }} language='yaml' />
      </div>
    </div>
  }</>;
}

export default SampleRenderer;