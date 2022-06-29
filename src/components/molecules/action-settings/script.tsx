import React, { forwardRef, useImperativeHandle } from 'react';
import Editor from 'react-simple-code-editor';
// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import styled from "styled-components";

export const ScriptSettings = forwardRef((props, ref) => {
  const [code, setCode] = React.useState('');

  useImperativeHandle(ref, () => ({
    getSettings() {
      return code;
    }
  }));

  return (
    <EditorWrapper>
      <StyledEditor
        placeholder="Type some code…"
        value={code}
        onValueChange={code => setCode(code)}
        highlight={code => highlight(code, languages.js)}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          background: '#f0f0f0',
        }}
      />
    </EditorWrapper>
  );
});

const EditorWrapper = styled.div`
  flex: 1;
  overflow: auto;
    /** hard-coded height */
  height: 100%;
  width: 100%;
`;

const StyledEditor = styled(Editor)`
  white-space: pre;
  caret-color: #fff;
  min-width: 100%;
  min-height: 100%;
  float: left;
  & > textarea,
  & > pre {
    outline: none;
    white-space: pre !important;
  }
`;
