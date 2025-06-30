import React from 'react';

export default function Overview({ text }) {
  if (!text) {
    return (
      <section className="section-block profile-empty-state">
        <div className="empty-icon" aria-hidden="true">💡</div>
        <p>No co-founder summary provided.</p>
      </section>
    );
  }

  return (
    <section className="section-block overview-section">
      <h3 className="section-header">
        <span className="section-icon" aria-hidden="true">💡</span>
        Co-founder Summary
      </h3>
      <p className="overview-text">{text}</p>
    </section>
  );
}
