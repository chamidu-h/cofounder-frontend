// src/components/JobCard.js
import React from 'react';
import DOMPurify from 'dompurify'; // Import the sanitizer
import ExpandableContent from './ExpandableContent';

const JobCard = ({ job, matchScore = null }) => {
    // 1. Sanitize the HTML string from the database before rendering.
    // This removes any potentially malicious scripts but keeps safe HTML tags like <b>, <ul>, <li>, etc.
    const sanitizedHtml = job.description_html
        ? DOMPurify.sanitize(job.description_html)
        : '<p class="info-message">No description available.</p>'; // Provide a fallback

    return (
        <div className="job-card section-block">
            <div className="job-card-header">
                <h3 className="job-title">{job.job_title}</h3>
                {/* Display match score only if it's provided */}
                {matchScore && <span className="match-score">Match Score: {matchScore.toFixed(2)}%</span>}
            </div>
            <h4 className="company-name">{job.company_name}</h4>

            {/*
              2. Use dangerouslySetInnerHTML to render the *sanitized* HTML.
              The property expects an object with a key `__html`.
            */}
            <ExpandableContent collapsedHeight="120px">
            <div
                className="job-description-content"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
            </ExpandableContent>

            <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="primary-button job-link-button">
                View & Apply
            </a>
        </div>
    );
};

export default JobCard;
