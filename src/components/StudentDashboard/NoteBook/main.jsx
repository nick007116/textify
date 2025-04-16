import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaPaperPlane, FaFile, FaCode, FaBook } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import Sidenav from "./sidenav";
import NoteNav from "./notenav";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./notebook.css";
import { db, auth } from "../../../utils/Firebase";
import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getAIResponse } from "../../../utils/aiService";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

const NoteBook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const urlTitle = decodeURIComponent(params.get("title") || "");
  const [mobileView, setMobileView] = useState("code"); // "files", "code", or "notes"

  // Use sessionStorage for persistence
  const [title, setTitle] = useState(() => {
    const storedTitle = sessionStorage.getItem('currentProjectTitle');
    return storedTitle || urlTitle;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);
  const [user, setUser] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/student-login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Store title in sessionStorage when it changes
  useEffect(() => {
    if (title) {
      sessionStorage.setItem('currentProjectTitle', title);
    }
  }, [title]);

  // Restore title from URL when component mounts
  useEffect(() => {
    if (urlTitle) {
      setTitle(urlTitle);
    }
  }, [urlTitle]);

  const pdfToTextFromBuffer = async (arrayBuffer) => {
    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        text += pageText + "\n";
      }
      return text.trim();
    } catch (error) {
      return "";
    }
  };

  const docToTextFromBuffer = async (arrayBuffer) => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      return "";
    }
  };

  // Real-time files listener
  useEffect(() => {
    if (!title || !user) return;

    const materialsRef = collection(db, "materials");
    const q = query(materialsRef, where("title", "==", title));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const materialData = snapshot.docs[0].data();
        const firestoreFiles = materialData.files || [];

        const filesWithContent = await Promise.all(
          firestoreFiles.map(async (file) => {
            if ((!file.content || file.content === undefined) && file.url) {
              const fileLower = file.name.toLowerCase();
              try {
                const response = await fetch(file.url);
                const arrayBuffer = await response.arrayBuffer();
                if (fileLower.endsWith(".pdf")) {
                  const text = await pdfToTextFromBuffer(arrayBuffer);
                  return { ...file, content: text };
                } else if (fileLower.endsWith(".doc") || fileLower.endsWith(".docx")) {
                  const text = await docToTextFromBuffer(arrayBuffer);
                  return { ...file, content: text };
                } else {
                  const text = await response.text();
                  return { ...file, content: text };
                }
              } catch (error) {
                return file;
              }
            }
            return file;
          })
        );
        setFiles(filesWithContent);
      } else {
        setFiles([]);
      }
    });

    return () => unsubscribe();
  }, [title, user]);

  // Real-time chat listener
  useEffect(() => {
    if (!title || !user) return;

    // Create a unique chat ID using both title and user ID to ensure personalization
    const chatId = `${title}_${user.uid}`;
    const chatDocRef = doc(db, "chats", chatId);
    
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        const chatData = doc.data();
        setMessages(chatData.messages || []);
      } else {
        // If no chat exists for this user and title, initialize an empty array
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [title, user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || isLoading || !user) return;

    try {
      setIsLoading(true);
      const userMessage = { text: newMessage, sender: "user" };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setNewMessage("");

      const relevantFiles = files.map((file) => ({
        name: file.name,
        content: file.content,
        type: file.name.split(".").pop().toLowerCase(),
      }));

      const formattedContext = relevantFiles
        .map((file) => `Document: ${file.name}\nType: ${file.type}\nContent:\n${file.content}`)
        .join("\n\n");

      const aiResponse = await getAIResponse(newMessage, formattedContext);
      const aiMessage = { text: aiResponse, sender: "ai" };
      const finalMessages = [...updatedMessages, aiMessage];

      // Create a unique chat ID using both title and user ID
      const chatId = `${title}_${user.uid}`;
      
      await setDoc(doc(db, "chats", chatId), {
        userId: user.uid,
        title: title,
        messages: finalMessages,
        timestamp: new Date(),
      });

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "I apologize, but I encountered an error while processing your request. Please try again.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="notebook-container">
      {/* Mobile Navigation */}
      <div className="mobile-nav">
        <button 
          className={`mobile-nav-btn ${mobileView === "files" ? "active" : ""}`}
          onClick={() => setMobileView("files")}
        >
          <FaFile />
          <span>Files</span>
        </button>
        <button 
          className={`mobile-nav-btn ${mobileView === "code" ? "active" : ""}`}
          onClick={() => setMobileView("code")}
        >
          <FaCode />
          <span>Chat</span>
        </button>
        <button 
          className={`mobile-nav-btn ${mobileView === "notes" ? "active" : ""}`}
          onClick={() => setMobileView("notes")}
        >
          <FaBook />
          <span>Notes</span>
        </button>
      </div>
      
      <div className={`left-sidebar ${leftSidebarOpen ? "open" : "closed"} ${mobileView === "files" ? "mobile-view-active" : ""}`}>
        <div className="sidebar-content">
          <Sidenav title={title} files={files} isOpen={leftSidebarOpen} />
        </div>
        <button
          className="sidebar-toggle left"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        >
          {leftSidebarOpen ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <main className={`main-content ${!leftSidebarOpen && !rightSidebarOpen ? "full-width" : ""} ${mobileView === "code" ? "mobile-view-active" : ""}`}>
        <div className="content-wrapper">
          <div className="chat-container">
            <div className="chat-messages" ref={chatContainerRef}>
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  {message.sender === "ai" ? (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  ) : (
                    message.text
                  )}
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <textarea
                className="chat-input"
                placeholder={isLoading ? "AI is thinking..." : "Type your message here..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                className={`send-button ${isLoading ? "disabled" : ""}`}
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                <FaPaperPlane className="send-icon" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <div className={`right-sidebar ${rightSidebarOpen ? "open" : "closed"} ${mobileView === "notes" ? "mobile-view-active" : ""}`}>
        <button
          className="sidebar-toggle right"
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        >
          {rightSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
        <div className="sidebar-content">
          <NoteNav isOpen={rightSidebarOpen} projectTitle={title} />
        </div>
      </div>
    </div>
  );
};

export default NoteBook;