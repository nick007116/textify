import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import { db, auth } from "../../utils/Firebase";
import { useNavigate } from "react-router-dom";
import { Clock, MessageSquare, Book } from "lucide-react";
import "./css/Recent.css";
import Sidebar from "./Sidebar";

const RecentVisit = () => {
  const [chatCards, setChatCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/student-login");
        return;
      }

      try {
        const chatsRef = collection(db, "chats");
        const chatsQuery = query(
          chatsRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(6)
        );

        const querySnapshot = await getDocs(chatsQuery);
        const chatsPromises = querySnapshot.docs.map(async (doc) => {
          // Get accurate notes count for each chat
          const notesQuery = query(
            collection(db, "notes"),
            where("userId", "==", user.uid),
            where("projectTitle", "==", doc.id)
          );
          const notesSnapshot = await getCountFromServer(notesQuery);

          return {
            id: doc.id,
            title: doc.id,
            ...doc.data(),
            notesCount: notesSnapshot.data().count,
          };
        });

        const chatsData = await Promise.all(chatsPromises);
        setChatCards(chatsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);
  const handleCardClick = (title) => {
    navigate(`/notebook?title=${encodeURIComponent(title)}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div className="materials-section">
          <h2 className="section-title">Recent Chats</h2>
          <div className="dashboard-grid">
            {chatCards.length > 0 ? (
              chatCards.map((chat) => (
                <div
                  key={chat.id}
                  className="chat-card"
                  onClick={() => handleCardClick(chat.title)}
                >
                  <div className="chat-card__content">
                    <div className="chat-card__header">
                      <h3 className="chat-card__title">{chat.title}</h3>
                      <span className="chat-card__date">
                        <Clock className="chat-card__icon" />
                        {chat.timestamp &&
                          new Date(chat.timestamp.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="chat-card__stats">
                      <p className="chat-card__stats-text">
                        <Book className="chat-card__icon" />
                        {chat.notesCount}{" "}
                        {chat.notesCount === 1 ? "Note" : "Notes"} Created
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Book className="empty-state__icon" />
                <p className="empty-state__text">No recent chats available</p>
                <span className="empty-state__subtext">
                  Your recent chat history will appear here
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentVisit;
