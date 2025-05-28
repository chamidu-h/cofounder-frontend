import React from 'react';

export default function LanguageStats({ data }) {
  return (
    <section>
      <h3>Language Stats</h3>
      <ul className="language-stats">
        {Object.entries(data).map(([lang, pct]) => (
          <li key={lang}>{lang}: {pct}%</li>
        ))}
      </ul>
    </section>
  );
}
