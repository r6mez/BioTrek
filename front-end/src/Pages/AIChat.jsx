import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import chatbotService from "../services/chatbotService";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import ChartRenderer from "../components/ChartRenderer";
import { extractChartsFromText, extractChartFromMetadata, parseChartDirective } from "../utils/dataParser";

export default function AIChat() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: "AI", text: "Hello! I am your NASA BioTrek AI assistant. I can help you with space exploration, NASA missions, and answer your questions about the cosmos based on NASA research documents.\n\n✨ **New Feature:** I can now visualize data with interactive charts! Try asking questions about statistics, trends, or comparisons.\n\n💡 Type `/test-chart` to see a demo of the visualization feature.\n\nHow can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSources, setCurrentSources] = useState([]);
  const [showSources, setShowSources] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [error, setError] = useState(null);
  const outputRef = useRef(null);
  
  // Chat history states
  const [chatHistories, setChatHistories] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState(true); // Default true for desktop
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      // On mobile, close by default; on desktop, open by default
      if (window.innerWidth >= 1024) {
        setShowHistorySidebar(true);
      } else {
        setShowHistorySidebar(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Check chatbot health status
  useEffect(() => {
    const checkHealthStatus = async () => {
      if (isAuthenticated) {
        try {
          const status = await chatbotService.getHealthStatus();
          setHealthStatus(status);
        } catch (error) {
          console.error('Failed to check chatbot health:', error);
          setHealthStatus({ status: 'error', initialized: false });
        }
      }
    };

    checkHealthStatus();
  }, [isAuthenticated]);

  // Load chat histories
  useEffect(() => {
    const loadChatHistories = async () => {
      if (isAuthenticated) {
        try {
          const histories = await chatbotService.getChatHistories();
          setChatHistories(histories);
        } catch (error) {
          console.error('Failed to load chat histories:', error);
        }
      }
    };

    loadChatHistories();
  }, [isAuthenticated]);

  // Start a new chat
  const startNewChat = async () => {
    // Just reset the UI, don't create a chat until the first message
    setCurrentChatId(null);
    setMessages([
      { sender: "AI", text: "Hello! I am your NASA BioTrek AI assistant. How can I help you today?" }
    ]);
  };

  // Load a specific chat history
  const loadChatHistory = async (chatId) => {
    try {
      setIsLoadingHistory(true);
      const chatHistory = await chatbotService.getChatHistoryById(chatId);
      
      // Convert chat history messages to the format used by the UI
      const formattedMessages = chatHistory.messages.map(msg => {
        const message = {
          sender: msg.role === 'user' ? 'User' : 'AI',
          text: msg.content,
          sources: msg.metadata?.sources || [],
          metadata: msg.metadata,
        };
        
        // Extract charts from historical messages
        if (msg.role === 'ai') {
          const charts = extractChartsFromText(msg.content);
          const chartDirectives = parseChartDirective(msg.content);
          const metadataChart = extractChartFromMetadata(msg.metadata);
          
          const allCharts = [
            ...chartDirectives,
            ...(metadataChart ? [metadataChart] : []),
            ...charts
          ];
          
          if (allCharts.length > 0) {
            message.charts = allCharts;
          }
        }
        
        return message;
      });

      setMessages(formattedMessages.length > 0 ? formattedMessages : [
        { sender: "AI", text: "Hello! I am your NASA BioTrek AI assistant. How can I help you today?" }
      ]);
      setCurrentChatId(chatId);
      setShowHistorySidebar(false);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Start editing a chat title
  const startEditingChat = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  // Save edited chat title
  const saveEditedTitle = async (chatId) => {
    if (!editingTitle.trim()) {
      setEditingChatId(null);
      return;
    }

    try {
      await chatbotService.updateChatHistory(chatId, editingTitle.trim());
      setChatHistories(chatHistories.map(chat => 
        chat.id === chatId ? { ...chat, title: editingTitle.trim() } : chat
      ));
      setEditingChatId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update chat title:', error);
      setError('Failed to update chat title');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  // Delete a specific chat
  const deleteChatHistory = async (chatId) => {
    try {
      await chatbotService.deleteChatHistory(chatId);
      setChatHistories(chatHistories.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was the current one, start a new chat
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([
          { sender: "AI", text: "Hello! I am your NASA BioTrek AI assistant. How can I help you today?" }
        ]);
      }
    } catch (error) {
      console.error('Failed to delete chat history:', error);
      setError('Failed to delete chat');
    }
  };

  // Clear all chat history
  const clearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
      return;
    }

    try {
      await chatbotService.clearAllChatHistory();
      setChatHistories([]);
      setCurrentChatId(null);
      setMessages([
        { sender: "AI", text: "Hello! I am your NASA BioTrek AI assistant. How can I help you today?" }
      ]);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      setError('Failed to clear history');
    }
  };

  // Generate a meaningful title from the user message
  const generateChatTitle = (message) => {
    // Truncate to 50 characters and add ellipsis if needed
    const maxLength = 50;
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength).trim() + '...';
  };

  // Send user message
  const handleSend = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    
    // Check for test commands
    if (userMessage.toLowerCase() === '/test-chart' || userMessage.toLowerCase() === '/chart-test') {
      setMessages(prev => [...prev, { sender: "User", text: userMessage }]);
      setInput("");
      
      // Show test visualization
      const testCharts = [
        {
          data: [
            { month: "Jan", missions: 8 },
            { month: "Feb", missions: 12 },
            { month: "Mar", missions: 15 },
            { month: "Apr", missions: 18 },
            { month: "May", missions: 22 },
            { month: "Jun", missions: 25 }
          ],
          title: "NASA Missions by Month (Test Data)",
          type: "line"
        },
        {
          data: [
            { category: "Research", value: 35 },
            { category: "Development", value: 30 },
            { category: "Operations", value: 25 },
            { category: "Training", value: 10 }
          ],
          title: "Budget Distribution (Test Data)",
          type: "pie"
        }
      ];
      
      setMessages(prev => [
        ...prev,
        {
          sender: "AI",
          text: "**Chart Visualization Test**\n\nHere are some sample visualizations to demonstrate the charting capability:\n\n1. **Line Chart** - Shows mission trends over time\n2. **Pie Chart** - Shows budget distribution by category\n\nTo get real charts, ask questions that involve data or statistics. For example:\n- \"Show me mission statistics\"\n- \"Compare space agency budgets\"\n- \"Display temperature trends\"\n\nOr visit `/chart-test` page for more examples!",
          charts: testCharts
        }
      ]);
      return;
    }
    
    setMessages(prev => [...prev, { sender: "User", text: userMessage }]);
    setInput("");
    setIsTyping(true);
    setError(null);
    
    try {
      // If no current chat, create one with the first message as title
      let chatId = currentChatId;
      if (!chatId) {
        const title = generateChatTitle(userMessage);
        const newChat = await chatbotService.createChatHistory(title);
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setChatHistories([newChat, ...chatHistories]);
      }

      // Ask question with chat history ID
      const response = await chatbotService.askQuestion(userMessage, chatId);
      
      // Extract charts from response
      const charts = extractChartsFromText(response.answer);
      const chartDirectives = parseChartDirective(response.answer);
      const metadataChart = extractChartFromMetadata(response);
      
      const allCharts = [
        ...chartDirectives,
        ...(metadataChart ? [metadataChart] : []),
        ...charts
      ];
      
      // Debug logging
      console.log('Chatbot Response:', response);
      console.log('Extracted charts:', allCharts);
      
      setMessages(prev => [
        ...prev,
        { 
          sender: "AI", 
          text: response.answer,
          sources: response.sources || [],
          charts: allCharts.length > 0 ? allCharts : undefined
        },
      ]);
      
      // Update current sources for the sources panel
      if (response.sources && response.sources.length > 0) {
        setCurrentSources(response.sources);
      }

      // Refresh chat histories to update the timestamp
      const histories = await chatbotService.getChatHistories();
      setChatHistories(histories);
      
    } catch (error) {
      console.error('Chatbot error:', error);
      setError(error.message);
      setMessages(prev => [
        ...prev,
        { 
          sender: "AI", 
          text: `I apologize, but I encountered an error: ${error.message}. Please try again or contact support if the issue persists.`,
          isError: true
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle sources panel
  const toggleSources = () => {
    setShowSources(!showSources);
  };

  // Get sources for a specific message
  const getMessageSources = async () => {
    try {
      const sources = await chatbotService.getLastSources();
      setCurrentSources(sources);
      setShowSources(true);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    }
  };


  // File upload to backend

  const handleFileUpload = async (e) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setMessages((prev) => [
      ...prev,
      { sender: "User", text: `Uploading file: ${file.name}...` },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3000/api/v1/files/upload", {
        method: "POST",
        headers: {
          "x-custom-lang": "en",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // لو endpoint محمي
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { sender: "AI", text: `File uploaded successfully! File ID: ${data.id || "N/A"}` },
        ]);
        console.log("Upload response:", data);
      } else {
        const err = await response.json();
        setMessages((prev) => [
          ...prev,
          { sender: "AI", text: `Upload failed: ${err.message || "Server error"}` },
        ]);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Upload failed due to network/server error." },
      ]);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col h-screen w-screen relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white font-poppins pt-20">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen w-screen relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white font-poppins pt-20 overflow-hidden">
        
        {/* Mobile Overlay */}
        {showHistorySidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowHistorySidebar(false)}
          />
        )}
        
        {/* History Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          transition-all duration-300 
          border-r border-gray-700/50 bg-gray-800/95 lg:bg-gray-800/30 backdrop-blur-sm 
          flex flex-col
          mt-20 lg:mt-0
          ${showHistorySidebar ? 'w-80 translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:-translate-x-0'}
        `}>
          {showHistorySidebar && (
            <button
              onClick={() => setShowHistorySidebar(false)}
              className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div className={`flex-1 flex flex-col min-h-0 ${showHistorySidebar ? 'opacity-100' : 'opacity-0 lg:opacity-0 pointer-events-none'} transition-opacity duration-300`}>
              <div className="p-4 border-b border-gray-700/50">
                <h2 className="text-lg font-semibold mb-3">Chat History</h2>
                <button
                  onClick={startNewChat}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Chat
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : chatHistories.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No chat history yet
                  </div>
                ) : (
                  chatHistories.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg transition-colors group ${
                        currentChatId === chat.id
                          ? 'bg-blue-600/20 border border-blue-500/50'
                          : 'bg-gray-700/30 hover:bg-gray-700/50 border border-transparent'
                      }`}
                    >
                      {editingChatId === chat.id ? (
                        // Edit mode
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                saveEditedTitle(chat.id);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                cancelEditing();
                              }
                            }}
                            className="flex-1 bg-gray-900/50 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 min-w-0"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveEditedTitle(chat.id);
                            }}
                            className="text-green-400 hover:text-green-300 flex-shrink-0"
                            title="Save"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEditing();
                            }}
                            className="text-gray-400 hover:text-white flex-shrink-0"
                            title="Cancel"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        // View mode
                        <div
                          className="cursor-pointer"
                          onClick={() => loadChatHistory(chat.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-white truncate">{chat.title}</h3>
                              <p className="text-xs text-gray-400 mt-1">
                                {chat.messageCount} messages • {new Date(chat.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingChat(chat.id, chat.title);
                                }}
                                className="text-gray-400 hover:text-blue-400"
                                title="Rename"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChatHistory(chat.id);
                                }}
                                className="text-gray-400 hover:text-red-400"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {chatHistories.length > 0 && (
                <div className="p-4 border-t border-gray-700/50">
                  <button
                    onClick={clearAllHistory}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Clear All History
                  </button>
                </div>
              )}
            </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Health Status Bar */}
          {healthStatus && (
            <div className="bg-gray-800/50 border-b border-gray-700/50 px-3 sm:px-6 py-2 flex-shrink-0">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  {/* History Toggle Button */}
                  <button
                    onClick={() => setShowHistorySidebar(!showHistorySidebar)}
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                    title={showHistorySidebar ? "Hide chat history" : "Show chat history"}
                  >
                    {showHistorySidebar ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      healthStatus.status === 'healthy' ? 'bg-green-500' :
                      healthStatus.status === 'initializing' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs sm:text-sm text-gray-300 truncate">
                      <span className="hidden sm:inline">Chatbot Status: </span>
                      {healthStatus.status === 'healthy' ? 'Ready' : 
                       healthStatus.status === 'initializing' ? 'Initializing...' : 
                       'Error'}
                    </span>
                  </div>
                </div>
                {currentSources.length > 0 && (
                  <button
                    onClick={toggleSources}
                    className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">Sources ({currentSources.length})</span>
                    <span className="sm:hidden">({currentSources.length})</span>
                  </button>
                )}
              </div>
            </div>
          )}

      {/* Main Content */}
      <div className="flex-1 flex relative z-10 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div
            ref={outputRef}
            className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar flex flex-col items-center"
            style={{ scrollBehavior: 'smooth' }}
          >
          {!isAuthenticated && (
            <div className="w-full max-w-4xl animate-fade-in">
              <div className="max-w-2xl mx-auto bg-yellow-800/20 text-yellow-200 border border-yellow-600/30 px-6 py-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">
                      You need to be logged in to use the AI chat feature. Please log in to start chatting with our AI assistant.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-yellow-400">Authentication Required</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className="w-full max-w-4xl animate-fade-in px-2 sm:px-0"
            >
              <div className={`max-w-2xl mx-auto px-4 sm:px-6 py-4 rounded-2xl shadow-lg ${
                msg.sender === "User"
                  ? "bg-gradient-to-r from-blue-800 to-blue-900 text-white"
                  : msg.isError
                  ? "bg-red-800/50 text-red-100 border border-red-700"
                  : "bg-gray-800 text-gray-100 border border-gray-700"
              }`}>
                <div className="flex items-start gap-3">
                  {msg.sender === "AI" && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      msg.isError ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                      {msg.isError ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    {msg.sender === "AI" && !msg.isError ? (
                      <>
                        <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              // Custom components for better styling
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="text-gray-200">{children}</li>,
                              h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-blue-300">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-blue-300">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-blue-300">{children}</h3>,
                              code: ({ inline, children }) => 
                                inline ? (
                                  <code className="bg-gray-700 text-blue-300 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                ) : (
                                  <code className="block bg-gray-700 text-gray-200 p-2 rounded text-xs font-mono overflow-x-auto">{children}</code>
                                ),
                              pre: ({ children }) => <pre className="bg-gray-700 p-2 rounded mb-2 overflow-x-auto">{children}</pre>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-3 italic text-gray-300 mb-2">{children}</blockquote>,
                              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                              em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                              a: ({ href, children }) => <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                              // Table components for proper rendering
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full border border-gray-600 rounded-lg">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }) => <thead className="bg-gray-700">{children}</thead>,
                              tbody: ({ children }) => <tbody className="bg-gray-800">{children}</tbody>,
                              tr: ({ children }) => <tr className="border-b border-gray-600">{children}</tr>,
                              th: ({ children }) => <th className="px-4 py-2 text-left text-xs font-semibold text-blue-300 border-r border-gray-600 last:border-r-0">{children}</th>,
                              td: ({ children }) => <td className="px-4 py-2 text-sm text-gray-200 border-r border-gray-600 last:border-r-0">{children}</td>,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                        {/* Render charts if available */}
                        {msg.charts && msg.charts.length > 0 && (
                          <div className="mt-3">
                            {msg.charts.map((chart, idx) => (
                              <ChartRenderer
                                key={idx}
                                data={chart.data}
                                title={chart.title}
                                chartType={chart.type}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <button
                          onClick={() => {
                            setCurrentSources(msg.sources);
                            setShowSources(true);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Sources ({msg.sources.length})
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">
                        {msg.sender === "User" ? "You" : "Biotrek Chatbot"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="w-full max-w-4xl animate-fade-in">
              <div className="max-w-2xl mx-auto bg-gray-800 text-gray-100 border border-gray-700 px-6 py-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-400 ml-2">AI is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Input Area */}
          <div className="p-3 sm:p-6 flex justify-center flex-shrink-0">
            <div className="w-full max-w-4xl">
              {error && (
                <div className="mb-4 bg-red-800/20 text-red-200 border border-red-600/30 px-4 py-3 rounded-lg mx-2 sm:mx-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
              <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-3 sm:p-4 shadow-2xl">
                <div className="flex gap-2 sm:gap-3 items-end">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`${!isAuthenticated ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium flex-shrink-0`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="hidden sm:inline">Upload</span>
                </label>

                <div className="flex-1 relative min-w-0 w-full sm:w-auto">
                  <textarea
                    placeholder={!isAuthenticated ? "Please log in to start chatting..." : "Ask me anything about space, NASA missions, or the cosmos..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isAuthenticated}
                    className={`w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 sm:px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none min-h-[40px] max-h-24 backdrop-blur-sm text-sm ${!isAuthenticated ? 'cursor-not-allowed opacity-50' : ''}`}
                    rows="1"
                    style={{
                      resize: 'none',
                      overflow: 'hidden'
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </div>
                
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !isAuthenticated || isTyping || (healthStatus && healthStatus.status !== 'healthy')}
                  className={`${!isAuthenticated || isTyping || (healthStatus && healthStatus.status !== 'healthy') ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium flex-shrink-0`}
                >
                  {isTyping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </button>
              </div>
              
              {uploadedFile && (
                <div className="mt-3 flex items-center gap-2 text-sm text-blue-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>File uploaded: {uploadedFile.name}</span>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Sources Panel */}
        {showSources && currentSources.length > 0 && (
          <div className="hidden lg:flex w-80 bg-gray-800/95 backdrop-blur-md border-l border-gray-700/50 flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Sources</h3>
                <button
                  onClick={toggleSources}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {currentSources.map((source, idx) => {
                // Handle different source data structures
                let title = 'Unknown';
                let link = null;
                let content = '';
                let page = null;
                let score = null;

                // Handle string representation of objects (parse if needed)
                let sourceObj = source;
                if (typeof source === 'string') {
                  try {
                    sourceObj = JSON.parse(source);
                  } catch (e) {
                    console.warn('Failed to parse source string:', source);
                    sourceObj = { content: source };
                  }
                }

                // Handle the specific structure from your backend
                try {
                  // Check if source.content contains stringified JSON with Title and Link
                  if (sourceObj.content && typeof sourceObj.content === 'string' && sourceObj.content.includes('Title')) {
                    // Replace single quotes with double quotes to make it valid JSON
                    const jsonString = sourceObj.content.replace(/'/g, '"');
                    const parsedContent = JSON.parse(jsonString);
                    
                    title = parsedContent.Title || parsedContent.title || 'Unknown';
                    link = parsedContent.Link || parsedContent.link || parsedContent.url;
                  }
                  // Check if source has metadata structure
                  else if (sourceObj.metadata) {
                    title = sourceObj.metadata.title || sourceObj.metadata.source || sourceObj.metadata.Title || 'Unknown';
                    link = sourceObj.metadata.link || sourceObj.metadata.Link || sourceObj.metadata.url;
                    page = sourceObj.metadata.page;
                    score = sourceObj.metadata.score;
                    content = sourceObj.pageContent || sourceObj.content || '';
                  }
                  // Check if source has direct Title/Link properties
                  else if (sourceObj.Title || sourceObj.Link) {
                    title = sourceObj.Title || 'Unknown';
                    link = sourceObj.Link;
                    content = sourceObj.content || sourceObj.pageContent || '';
                  }
                  // Fallback for other structures
                  else {
                    title = sourceObj.title || sourceObj.name || 'Unknown';
                    link = sourceObj.link || sourceObj.url;
                    content = sourceObj.content || sourceObj.pageContent || sourceObj.text || '';
                  }
                  
                  // Get other properties
                  page = page || sourceObj.metadata?.page || sourceObj.page;
                  score = score || sourceObj.metadata?.score || sourceObj.score;
                  
                } catch (parseError) {
                  console.warn('Failed to parse source content:', parseError);
                  // Fallback to original properties
                  title = sourceObj.title || sourceObj.metadata?.title || 'Unknown';
                  link = sourceObj.link || sourceObj.metadata?.link;
                  content = sourceObj.pageContent || sourceObj.content || '';
                }

                return (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                    <div className="text-sm text-gray-300 mb-2">
                      <strong>Document:</strong> 
                      {link ? (
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline ml-1"
                        >
                          {title}
                        </a>
                      ) : (
                        <span className="ml-1">{title}</span>
                      )}
                    </div>
                    
                    {sourceObj.pub_date && sourceObj.pub_date !== '1970-01-01' && (
                      <div className="text-xs text-gray-400 mb-2">
                        Published: {sourceObj.pub_date}
                      </div>
                    )}
                    
                    {page && (
                      <div className="text-xs text-gray-400 mb-2">
                        Page: {page}
                      </div>
                    )}
                    
                    {link && (
                      <div className="text-xs text-gray-400 mb-2">
                        <strong>Source:</strong> 
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline ml-1 break-all"
                        >
                          {link}
                        </a>
                      </div>
                    )}
                    
                    {content && !content.includes('Title') && (
                      <div className="text-xs text-gray-300 leading-relaxed">
                        {content}
                      </div>
                    )}
                    
                    {score && (
                      <div className="text-xs text-blue-400 mt-2">
                        Relevance: {(score * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
        </div>
      </div>
    </>
  );
}
