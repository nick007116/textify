import React from 'react';
import './css/Notes.css';

const Notes = () => {
  return (
    <div className="notes-container">
      <div className="notes-grid">
        {[1, 2, 3, 4].map((note) => (
          <div key={note} className="note-card">
            <h3>Note Title</h3>
            <p>Last edited • Today</p>
            <div className="note-content">
              This is a sample note content. Click to edit...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;