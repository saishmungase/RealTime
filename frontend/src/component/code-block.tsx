import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  duotoneLight
} from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
  theme?: 'dark' | 'light';
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, theme = 'dark' }) => {
  const decodedCode = code.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r');

  return (
    <SyntaxHighlighter
      language={language}
      style={theme === 'dark' ? vscDarkPlus : duotoneLight}
      showLineNumbers
      wrapLines
      customStyle={{
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontFamily: 'Fira Code, monospace',
        background: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
      }}
    >
      {decodedCode}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
