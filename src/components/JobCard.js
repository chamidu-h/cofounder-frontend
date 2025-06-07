// src/components/JobCard.js
import React from 'react';
import ExpandableContent from './ExpandableContent';
import StructuredDescription from './StructuredDescription';

const JobCard = ({ job }) => {
// Note: We no longer need the 'matchScore' prop, as all scoring
// information is now contained within the 'job' object itself.

return (
<div className="job-card section-block">
<div className="job-card-header">
<h3 className="job-title">{job.job_title}</h3>
{/*
Display the new, more accurate finalScore as a percentage.
This provides a single, clear metric of match quality to the user.
*/}
{job.finalScore && (
<span className="match-score">
{(job.finalScore * 100).toFixed(0)}% Match
</span>
)}
</div>
<h4 className="company-name">{job.company_name}</h4>

{/*
--- NEW: AI Analysis Badge ---
Display the AI's reasoning. This is crucial for showing the user
*why* a job is a good match, adding immense value and building trust.
*/}
{job.aiAnalysis && job.aiAnalysis.reason && (
<div className="ai-analysis-badge">
<span className="ai-icon">🤖</span>
AI Insight: {job.aiAnalysis.reason}
</div>
)}

{/* The rest of the component remains the same, using the existing ExpandableContent */}
<ExpandableContent collapsedHeight="100px">
<StructuredDescription
rawText={job.description_html}
jobTitle={job.job_title}
/>
</ExpandableContent>

<a href={job.job_url} target="_blank" rel="noopener noreferrer" className="primary-button job-link-button">
View & Apply
</a>
</div>
);
};

export default JobCard;