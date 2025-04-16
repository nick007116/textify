import React, { useState, useEffect } from 'react';
import { FaPlus, FaBook, FaTimes, FaDownload } from 'react-icons/fa';
import { db, auth } from '../../../utils/Firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const NoteNav = ({ isOpen, projectTitle }) => {
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch notes belonging to the current user and project
  const fetchNotes = async () => {
    if (!auth.currentUser || !projectTitle) {
      return;
    }

    setLoading(true);
    try {
      const notesRef = collection(db, 'notes');
      const q = query(
        notesRef,
        where('userId', '==', auth.currentUser.uid),
        where('projectTitle', '==', projectTitle)
      );

      const querySnapshot = await getDocs(q);
      const notesArray = [];
      
      querySnapshot.forEach(doc => {
        const noteData = doc.data();
        notesArray.push({ id: doc.id, ...noteData });
      });

      setNotes(notesArray);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes when component mounts or projectTitle changes
  useEffect(() => {
    if (projectTitle) {
      fetchNotes();
    }
  }, [projectTitle]);

  const handleNewNoteSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser || !projectTitle) {
      console.error('Missing requirements for note creation');
      return;
    }
  
    try {
      const noteData = {
        userId: auth.currentUser.uid,
        title: newTitle,
        description: newDesc,
        projectTitle: projectTitle, // Always include projectTitle
        timestamp: serverTimestamp(),
      };
  
      await addDoc(collection(db, 'notes'), noteData);
  
      setNewTitle('');
      setNewDesc('');
      setModalOpen(false);
      fetchNotes(); // Refresh notes list
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  const downloadNote = (note) => {
    const element = document.createElement("a");
    const fileContent = `Title: ${note.title}\n\nDescription:\n${note.description}`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title || 'note'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="note-nav">
      {isOpen ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="m-0">Notes</h5>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setModalOpen(true)}
            >
              <FaPlus className="me-2" />
              New Note
            </button>
          </div>

          {notes.length > 0 ? (
            <ul className="nav flex-column notes-list">
              {notes.map(note => (
                <li key={note.id} className="nav-item">
                  <a className="nav-link" href="#">
                    <div className="note-item d-flex align-items-center justify-content-between">
                      <div>
                        <span className="note-title">{note.title}</span>
                        <br />
                        <span className="note-date">
                          {note.timestamp
                            ? new Date(note.timestamp.seconds * 1000).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                      <button 
                        className="btn btn-link btn-download" 
                        onClick={() => downloadNote(note)}
                        title="Download Note"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notes available.</p>
          )}
        </>
      ) : (
        <div className="closed-nav">
          <button className="nav-icon-btn mb-3" onClick={() => setModalOpen(true)}>
            <FaBook />
          </button>
          <button className="nav-icon-btn" onClick={() => setModalOpen(true)}>
            <FaPlus />
          </button>
        </div>
      )}

      {/* Modal Popup */}
      {modalOpen && (
        <div
          className="modal show fade"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Note</h5>
                {/* Using btn-close which already provides an X */}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleNewNoteSubmit}>
                  <div className="mb-3">
                    <label htmlFor="noteTitle" className="form-label">
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="noteTitle"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="noteDesc" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="noteDesc"
                      rows="3"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Save Note
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteNav;