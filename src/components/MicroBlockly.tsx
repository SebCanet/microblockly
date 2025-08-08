import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';

interface MicroBlocklyProps {
  initialXml?: string;
  toolbox?: Blockly.utils.toolbox.ToolboxDefinition;
  workspaceOptions?: Blockly.BlocklyOptions;
  onCodeGeneration?: (code: string) => void;
}

export const MicroBlockly: React.FC<MicroBlocklyProps> = ({
  initialXml,
  toolbox,
  workspaceOptions = {},
  onCodeGeneration
}) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const codeDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Configure the workspace
    const options: Blockly.BlocklyOptions = {
      toolbox,
      ...workspaceOptions,
    };

    // Create the Blockly workspace
    const workspace = Blockly.inject(blocklyDiv.current, options);
    workspaceRef.current = workspace;

    // Load initial blocks if provided
    if (initialXml) {
      try {
        Blockly.Xml.domToWorkspace(
          Blockly.utils.xml.textToDom(initialXml),
          workspace
        );
      } catch (e) {
        console.error('Error loading initial blocks:', e);
      }
    }

    // Add change listener for code generation
    const updateCode = () => {
      if (!workspaceRef.current || !codeDiv.current) return;
      
      const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current);
      codeDiv.current.textContent = code;
      
      if (onCodeGeneration) {
        onCodeGeneration(code);
      }
    };

    workspace.addChangeListener(() => {
      updateCode();
    });

    // Cleanup
    return () => {
      workspace.dispose();
    };
  }, [initialXml, toolbox, workspaceOptions, onCodeGeneration]);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div 
        ref={blocklyDiv}
        style={{ flex: 1, minHeight: '400px' }}
      />
      <div 
        ref={codeDiv}
        style={{
          flex: 1,
          padding: '10px',
          backgroundColor: '#f5f5f5',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowY: 'auto',
        }}
      />
    </div>
  );
};
