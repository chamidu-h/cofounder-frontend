import React from 'react';

export default function ProfileHeader({ name, avatar_url, html_url, headline }) {
  return (
    <div className="profile-header">
      <img src={avatar_url} alt={`${name}'s avatar`} className="avatar" />
      <div>
        <h2>{name}</h2>
        <a href={html_url} target="_blank" rel="noopener noreferrer">GitHub Profile</a>
        {headline && <p className="headline">{headline}</p>}
      </div>
    </div>
  );
}
