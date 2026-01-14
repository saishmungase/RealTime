import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import * as monaco from 'monaco-editor';
import { MonacoBinding } from 'y-monaco';
import { editor } from 'monaco-editor';
import { Awareness, applyAwarenessUpdate } from 'y-protocols/awareness'; 
import { Play, X, Terminal, Loader2, CheckCircle, AlertCircle, Code2, Users, Check, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import moonImg from '../public/moon.png'
import sunImg from '../public/sun.png'

interface HistoryItem {
  id: string
  roomId: string
  language: string
  createdAt: string
  lastModified: string
  preview: string
}

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

const Room = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const historyIntervalRef = useRef<any | null>(null);
  const currentHistoryIdRef = useRef<string>('');
  
  const [connected, setConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [fileName, setFileName] = useState('main');
  const [fileExtension, setFileExtension] = useState('js');
  const [isJoined, setIsJoined] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [outputStatus, setOutputStatus] = useState('');
  const [mode, setMode] = useState(false)
  const [copied, setCopied] = useState(false);

  const pollTimeoutRef : any = useRef(null);
  const isUnmountedRef = useRef(false);
  const jobRouteRef = useRef(null);
  const maxExecutionTimeoutRef = useRef<any | null>(null);

  const navigate = useNavigate()

  const pollJobStatus = async () => {
    try {
      console.log("Job Ref :- " + jobRouteRef.current)
      const res = await fetch(`/api${jobRouteRef.current}`)
      const result = await res.json();
      console.log(result)
      handleJobStatus(result);
    } catch (error) {
      console.log(error)
      handleJobFailure("Proxy Error: Unable to reach backend.")
    }
  }

  const handleJobStatus = (result : {status : string, message : string, data : { response : {output : string, status : string}}}) => {
    switch(result.status){
      case "pending":
        setTerminalOutput("Analyzing code...")
        setOutputStatus("pending")
        scheduleNextPoll();
        break;
      
      case "pop-success":
        console.log(result)
        setTerminalOutput(result.data.response.output || "Execution Completed")
        setOutputStatus(result.data.response.status)
        stopPolling();
        if(maxExecutionTimeoutRef.current) clearTimeout(maxExecutionTimeoutRef.current);
        break;
      
      case "pop-issue":
        handleJobFailure(result.message || "Execution Failed")
        break;

      default:
        handleJobFailure("Unknown job state");
    }
  }

  const scheduleNextPoll = () => {
    if(isUnmountedRef.current) return;

    pollTimeoutRef.current = setTimeout(() => {
      pollJobStatus();
    }, 2000)
  }

  const stopPolling = () => {
    clearTimeout(pollTimeoutRef?.current);
    setIsRunning(false);
  }

  const handleJobFailure = (message : string) => {
    setTerminalOutput(message);
    setOutputStatus("error")
    stopPolling();
  }

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      stopPolling();
    };
  }, []);

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const isSaveHistoryEnabled = () => {
    try {
      const saveHistory = localStorage.getItem('saveHistory');
      return saveHistory === 'true';
    } catch (error) {
      console.error('Error checking saveHistory:', error);
      return false;
    }
  };

  const getCodingHistory = (): HistoryItem[] => {
    try {
      const history = localStorage.getItem('codingHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting coding history:', error);
      return [];
    }
  };

  const saveCodingHistory = (historyItems: HistoryItem[]) => {
    try {
      localStorage.setItem('codingHistory', JSON.stringify(historyItems));
    } catch (error) {
      console.error('Error saving coding history:', error);
    }
  };

  const saveCurrentCodeToHistory = () => {
    if (!isSaveHistoryEnabled() || !editorRef.current || !isJoined) {
      return;
    }

    const currentCode = editorRef.current.getValue();
    const currentTime = new Date().toISOString();
    
    if (!currentCode.trim()) {
      return;
    }

    const history = getCodingHistory();
    const currentHistoryId = currentHistoryIdRef.current;

    const existingIndex = history.findIndex(item => item.id === currentHistoryId);
    
    if (existingIndex !== -1) {
      history[existingIndex] = {
        ...history[existingIndex],
        lastModified: currentTime,
        preview: currentCode,
        language: fileExtension
      };
    } else {
      const newHistoryItem: HistoryItem = {
        id: currentHistoryId,
        roomId: userName,
        language: fileExtension,
        createdAt: currentTime,
        lastModified: currentTime,
        preview: currentCode
      };
      history.push(newHistoryItem);
    }

    saveCodingHistory(history);
  };

  const startHistorySaving = () => {
    if (!isSaveHistoryEnabled()) {
      return;
    }

    currentHistoryIdRef.current = generateUniqueId();

    if (historyIntervalRef.current) {
      clearInterval(historyIntervalRef.current);
    }

    historyIntervalRef.current = setInterval(() => {
      saveCurrentCodeToHistory();
    }, 20000); 
  };

  const stopHistorySaving = () => {
    if (historyIntervalRef.current) {
      clearInterval(historyIntervalRef.current);
      historyIntervalRef.current = null;
    }
  };

  const saveFinalCodeAndLeave = () => {
    saveCurrentCodeToHistory();
    
    stopHistorySaving();
    
    setIsJoined(false);
  };

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substring(2, 15)
    setUserName(newRoomId)
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(userName)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleJoinRoom = () => {
    if (userName.trim()) {
      setIsJoined(true);
    }
  };

  const handleMode = () => {
    setMode(!mode);
  }

  const handleRunCode = async () => {
    if (!editorRef.current) return;
    
    setIsRunning(true);
    setShowTerminal(true);
    setTerminalOutput('Running code...');
    setOutputStatus('');
    maxExecutionTimeoutRef.current = setTimeout(() => {
      handleJobFailure("Execution timed out (Internal Server Limit reached).");
    }, 30000);
    
    try {
      const code = editorRef.current.getValue();
      const language = fileExtension;
      console.log("Data: -", fileName + "." + language + "( " + getLanguageFromExtension(language) + " )")
      const response = await fetch(`/api/set-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          user : "CodeSync", 
          filename : fileName,
          language : getLanguageFromExtension(language),
          code : code, 
          extension : language
        }),
      });
      
      const result = await response.json(); 
      console.log(result)
      if(result.status !== "push-success"){
        handleJobFailure("Unable to Add You Code for Execution.")
        return;
      } 

      console.log(result.statusUrl)
      jobRouteRef.current = result.statusUrl;
      pollJobStatus();

    } catch (error : any) {
      handleJobFailure(error.message);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      const newTheme = mode ? 'vs-dark' : 'vs';
      monaco.editor.setTheme(newTheme);
    }
  }, [mode]);

  useEffect(() => {
    if (!isJoined || !containerRef.current) return;

    startHistorySaving();

    const yDoc = new Y.Doc();
    const yText = yDoc.getText('monaco');
    
    const model = monaco.editor.createModel('', getLanguageFromExtension(fileExtension));
    const editor = monaco.editor.create(containerRef.current, {
      model,
      theme: 'vs',
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

    const socket = new WebSocket("wss://realtime-x8ey.onrender.com"); 
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
      
      setIsJoined(true);
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
      stopHistorySaving();
      
      if (binding) binding.destroy();
      if (awareness) awareness.destroy();
      if (yDoc) yDoc.destroy();
      if (editor) editor.dispose();
      if (socket && socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [isJoined, userName, fileName, fileExtension]);

  useEffect(() => {
    return () => {
      stopHistorySaving();
    };
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Collaborative Editor
          </h1>
          <p className="text-xl text-gray-600">Join or create a coding room</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 w-full max-w-md"
        >
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">Room ID</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter custom room ID or generate one"
                className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateRoomId}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Generate
              </motion.button>
            </div>

            {userName && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Your Room ID:</p>
                    <p className="text-lg font-mono font-bold text-blue-800">{userName}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyRoomId}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-800 mb-4">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="main"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
            />
          </div>

          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">Language</label>
            <select
              value={fileExtension}
              onChange={(e) => setFileExtension(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg bg-white"
            >
              <option value="js">JavaScript (.js)</option>
              <option value="ts">TypeScript (.ts)</option>
              <option value="py">Python (.py)</option>
              <option value="java">Java (.java)</option>
              <option value="rs">Rust (.rs)</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoinRoom}
            disabled={!userName.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Users className="w-5 h-5" />
            Join/Create Room
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="w-full py-4 bg-black text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mt-2"
          >
            Go Back
          </motion.button>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
            <div className="flex items-start gap-3">
              <Code2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1 text-sm">Real-time Collaboration</h3>
                <p className="text-blue-700 text-xs">
                  Code together with others in real-time with syntax highlighting and live updates.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
    >
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-b border-blue-500/30 shadow-2xl backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&#34;60&#34; height=&#34;60&#34; viewBox=&#34;0 0 60 60&#34; xmlns=&#34;http://www.w3.org/2000/svg&#34;%3E%3Cg fill=&#34;none&#34; fill-rule=&#34;evenodd&#34;%3E%3Cg fill=&#34;%239C92AC&#34; fill-opacity=&#34;0.1&#34;%3E%3Ccircle cx=&#34;30&#34; cy=&#34;30&#34; r=&#34;4&#34;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
        </div>
        
        <div className="relative flex justify-between items-center">
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center space-x-6"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: connected ? 0 : 180 }}
                transition={{ duration: 0.5 }}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <Code2 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <motion.h2 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-2xl font-bold flex items-center"
                >
                  <span className={`bg-gradient-to-r from-white ${connected ? "to-green-300" : "to-red-300"} bg-clip-text text-transparent drop-shadow-sm`}>
                    {fileName}.{fileExtension}
                  </span>
                </motion.h2>
                <motion.p 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-sm text-blue-100 flex items-center mt-1"
                >
                  <span className="flex items-center">
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-blue-300 rounded-full mr-2"
                    />
                    Room: <span className="font-semibold mx-1">{userName}</span> • 
                    {connected ? 
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center font-semibold text-green-300 ml-1"
                      >
                        <CheckCircle size={14} className="ml-1 mr-1" />
                        Connected
                      </motion.span> : 
                      <motion.span 
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex items-center font-semibold text-red-300 ml-1"
                      >
                        <AlertCircle size={14} className="ml-1 mr-1" />
                        Disconnected
                      </motion.span>
                    }
                    {isSaveHistoryEnabled() && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center font-semibold text-yellow-300 ml-2"
                      >
                        • Auto-save enabled
                      </motion.span>
                    )}
                  </span>
                </motion.p>
              </div>
            </div>
          </motion.div>
                  
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMode()}
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-500 shadow-lg backdrop-blur-sm border ${
                mode 
                  ? "bg-gradient-to-r from-gray-800 to-gray-900 border-gray-600" 
                  : "bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-300"
              }`}
            >
              <motion.span
                animate={{ x: mode ? 40 : 4 }}
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className={`inline-block h-8 w-8 transform rounded-full shadow-xl border-2 ${
                  mode ? "bg-gray-100 border-gray-300" : "bg-white border-yellow-200"
                }`}
              >
                <motion.img 
                  key={mode ? 'moon' : 'sun'}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className='w-full h-full p-1 object-contain' 
                  src={mode ? moonImg : sunImg}
                  alt={mode ? "Dark mode" : "Light mode"}
                />
              </motion.span>
            </motion.button>
                
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(34, 197, 94, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRunCode}
              disabled={isRunning}
              className="relative py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all duration-300 shadow-lg border border-green-400/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={isRunning ? { x: ['-100%', '100%'] } : {}}
                transition={{ duration: 1.5, repeat: isRunning ? Infinity : 0 }}
              />
              <div className="relative flex items-center space-x-2">
                {isRunning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={16} />
                    </motion.div>
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Run Code</span>
                  </>
                )}
              </div>
            </motion.button>
              
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(107, 114, 128, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTerminal(!showTerminal)}
              className="py-3 px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all duration-300 shadow-lg border border-gray-500/30 backdrop-blur-sm"
            >
              <motion.div
                animate={showTerminal ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Terminal size={16} />
              </motion.div>
              <span>{showTerminal ? 'Hide Terminal' : 'Show Terminal'}</span>
            </motion.button>
              
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(239, 68, 68, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                saveFinalCodeAndLeave()
              }}
              className="py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all duration-300 shadow-lg border border-red-400/30 backdrop-blur-sm"
            >
              <X size={16} />
              <span>Leave Room</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
              
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className={`flex-grow transition-all duration-500 ${showTerminal ? 'h-2/3' : 'h-full'} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50" />
        <motion.div 
          ref={containerRef} 
          className="relative h-full w-full rounded-t-2xl overflow-hidden border-t border-gray-700/50 shadow-2xl backdrop-blur-sm" 
          layoutId="editor"
        />
        <div className="absolute inset-0 rounded-t-2xl border border-blue-500/20 pointer-events-none" />
      </motion.div>
              
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "33.333333%", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-t border-gray-700/50 overflow-hidden shadow-2xl"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="h-full p-6 overflow-auto relative"
            >
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&#34;20&#34; height=&#34;20&#34; viewBox=&#34;0 0 20 20&#34; xmlns=&#34;http://www.w3.org/2000/svg&#34;%3E%3Cg fill=&#34;%2300ff00&#34; fill-opacity=&#34;0.3&#34;%3E%3Cpath d=&#34;M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z&#34;/%3E%3C/g%3E%3C/svg%3E')]"></div>
              </div>
        
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative flex items-center justify-between mb-4"
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-2 bg-green-500/10 backdrop-blur-sm rounded-lg border border-green-500/20"
                  >
                    <Terminal size={18} className="text-green-400" />
                  </motion.div>
                  <h3 className="text-green-300 font-bold text-lg">Terminal Output</h3>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                </div>
                {outputStatus && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className={`text-sm px-4 py-2 rounded-full font-bold border backdrop-blur-sm ${
                      outputStatus === 'Success' 
                        ? 'bg-green-900/50 text-green-300 border-green-500/30' 
                        : 'bg-red-900/50 text-red-300 border-red-500/30'
                    }`}
                  >
                    {outputStatus}
                  </motion.span>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 shadow-inner"
              >
                <pre className="text-green-300 font-mono text-sm overflow-auto whitespace-pre-wrap leading-relaxed">
                  {terminalOutput || (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-gray-500"
                    >
                      Ready to run code...
                    </motion.span>
                  )}
                </pre>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Room;
