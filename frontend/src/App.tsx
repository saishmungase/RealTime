import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import * as monaco from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';
import { Awareness, applyAwarenessUpdate } from 'y-protocols/awareness'; 
import { Play, X, Terminal, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

self.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: string, label: string) {
    if (label === 'typescript' || label === 'javascript') {
      return './monaco-editor/ts.worker.js';
    }
    if (label === 'python') {
      return './monaco-editor/python.worker.js';
    }
    if (label === 'java') {
      return './monaco-editor/java.worker.js';
    }
    if (label === 'rust') {
      return './monaco-editor/rust.worker.js';
    }
    return './monaco-editor/editor.worker.js';
  }
};

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [connected, setConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [fileName, setFileName] = useState('main');
  const [fileExtension, setFileExtension] = useState('js');
  const [isJoined, setIsJoined] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [outputStatus, setOutputStatus] = useState('');
  
  const handleJoinRoom = () => {
    if (userName.trim()) {
      setIsJoined(true);
    }
  };

  const handleRunCode = async () => {
    if (!editorRef.current) return;
    
    setIsRunning(true);
    setShowTerminal(true);
    setTerminalOutput('Running code...');
    setOutputStatus('');
    
    try {
      const code = editorRef.current.getValue();
      const language = fileExtension;
      console.log(code, language);
      const response = await fetch('https://code-executor-q4yf.onrender.com/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code : code, language : language, fileName : fileName }),
      });
      
      const result = await response.json();
      console.log(result);
      setTerminalOutput(result.output);
      setOutputStatus(result.status);
    } catch (error) {
      setTerminalOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setOutputStatus('Error');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!isJoined || !containerRef.current) return;

    const yDoc = new Y.Doc();
    const yText = yDoc.getText('monaco');
    
    const model = monaco.editor.createModel('', getLanguageFromExtension(fileExtension));
    const editor = monaco.editor.create(containerRef.current, {
      model,
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 16,
      wordWrap: 'on',
      minimap: { enabled: true },
    });
    editorRef.current = editor;

    const awareness = new Awareness(yDoc);
    
    awareness.setLocalState({
      user: {
        name: userName,
        color: getRandomColor()
      }
    });

    const socket = new WebSocket("ws://localhost:8080"); 
    socket.binaryType = "arraybuffer";
    
    socket.onopen = () => {
      console.log("Connected to server");
      setConnected(true);
      
      socket.send(JSON.stringify({
        userName,
        type: 'init',
        fileName,
        fileExtension
      }));
    };

    socket.onclose = () => {
      console.log("Disconnected from server");
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onmessage = (event) => {
      try {
        if (event.data instanceof ArrayBuffer) {
          const update = new Uint8Array(event.data);
          Y.applyUpdate(yDoc, update);
          return;
        }

        const message = JSON.parse(event.data);
        console.log("Received message:", message);
        
        switch (message.type) {
          case 'welcome':
            console.log("Welcome message:", message.message);
            break;
            
          case 'init':
            if (message.update && message.update.length > 0) {
              const update = new Uint8Array(message.update);
              Y.applyUpdate(yDoc, update);
              console.log("File From Backend :- " + message.file+message.extension)
              setFileExtension(message.extension)
              setFileName(message.file)
            }
            break;
            
          case 'update':
            if (message.update) {
              const update = new Uint8Array(message.update);
              Y.applyUpdate(yDoc, update);
            }
            break;
            
          case 'awareness':
            if (message.update) {
              const update = new Uint8Array(message.update);
              applyAwarenessUpdate(awareness, update, null);
            }
            break;
            
          case 'error':
            console.error("Server error:", message.message);
            break;
            
          default:
            console.log("Unknown message type:", message.type);
        }
      } catch (err) {
        console.error("Error processing message:", err);
      }
    };

    const binding = new MonacoBinding(yText, model, new Set([editor]), awareness);

    yDoc.on('update', (update) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          userName,
          type: 'update',
          fileName,
          fileExtension,
          update: Array.from(update)
        }));
      }
    });

    awareness.on('update', (update : Uint8Array) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          userName,
          type: 'awareness',
          update: Array.from(update)
        }));
      }
    });

    return () => {
      if (binding) binding.destroy();
      if (awareness) awareness.destroy();
      if (yDoc) yDoc.destroy();
      if (editor) editor.dispose();
      if (socket && socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [isJoined, userName, fileName, fileExtension]);

  const getLanguageFromExtension = (ext: string) => {
    const extensionMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      "rs" : "rust",
    };
    
    const cleanExt = ext.startsWith('.') ? ext.substring(1) : ext;
    return extensionMap[cleanExt.toLowerCase()] || 'plaintext';
  };

  const getRandomColor = () => {
    const colors = [
      '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
      '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
      '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
      '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
      '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!isJoined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Collaborative Editor</h1>
          
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-gray-300">Room Code</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="Enter/Create Code"
            />
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-gray-300">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="main"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">Language</label>
            <select
              value={fileExtension}
              onChange={(e) => setFileExtension(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            >
              <option value="js">JavaScript (.js)</option>
              <option value="ts">TypeScript (.ts)</option>
              <option value="py">Python (.py)</option>
              <option value="java">Java (.java)</option>
              <option value="rs">Rust (.rs)</option>
            </select>
          </div>
          
          <button
            onClick={handleJoinRoom}
            disabled={!userName.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            Join/Create Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {fileName}.{fileExtension}
              </span>
            </h2>
            <p className="text-sm text-gray-400 flex items-center mt-1">
              <span className="flex items-center">
                Room: {userName} • {connected ? 
                  <span className="flex items-center text-green-400"><CheckCircle size={14} className="ml-1 mr-1" /> Connected</span> : 
                  <span className="flex items-center text-red-400"><AlertCircle size={14} className="ml-1 mr-1" /> Disconnected</span>}
              </span>
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Code</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors shadow-md"
          >
            <Terminal size={16} />
            <span>{showTerminal ? 'Hide Terminal' : 'Show Terminal'}</span>
          </button>
          <button
            onClick={() => setIsJoined(false)}
            className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors shadow-md"
          >
            <X size={16} />
            <span>Leave Room</span>
          </button>
        </div>
      </div>
      <div className={`flex-grow ${showTerminal ? 'h-2/3' : 'h-full'}`}>
        <div ref={containerRef} className="h-full w-full" />
      </div>
      {showTerminal && (
        <div className="h-1/3 bg-black p-4 border-t border-gray-700 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Terminal size={16} className="text-gray-400" />
              <h3 className="text-gray-300 font-medium">Terminal Output</h3>
            </div>
            {outputStatus && (
              <span className={`text-sm px-2 py-1 rounded font-medium ${outputStatus === 'Success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {outputStatus}
              </span>
            )}
          </div>
          <pre className="text-gray-300 font-mono text-sm overflow-auto whitespace-pre-wrap">{terminalOutput}</pre>
        </div>
      )}
    </div>
  );
};

export default App;