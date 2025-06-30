import React from 'react';

export default function LanguageStats({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <section className="section-block language-stats-section profile-empty-state">
        <div className="empty-icon" aria-hidden="true">🌐</div>
        <p>No language stats available.</p>
      </section>
    );
  }

  return (
    <section className="section-block language-stats-section">
      <h3 className="section-header">
        <span className="section-icon" aria-hidden="true">🌐</span>
        Language Stats
      </h3>
      <ul className="language-stats-list">
        {Object.entries(data).map(([lang, pct]) => (
          <li key={lang} className="language-stats-item">
            <span className="lang-label">{lang}</span>
            <span className="lang-bar-container">
              <span
                className="lang-bar"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                }}
                aria-label={`${lang} ${pct}%`}
              />
            </span>
            <span className="lang-percent">{pct}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
