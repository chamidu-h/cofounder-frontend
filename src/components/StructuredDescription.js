// src/components/StructuredDescription.js
import React from 'react';
import DOMPurify from 'dompurify';

// This function now accepts jobTitle as an argument.
const formatDescriptionToHtml = (rawText, jobTitle) => {
    if (!rawText || typeof rawText !== 'string') {
        return '<p class="info-message">No description available.</p>';
    }

    let processedText = rawText.trim();

    // --- NEW: PREFIX REMOVAL LOGIC ---
    // Check if the description text starts with the job title (case-insensitive).
    if (jobTitle && processedText.toLowerCase().startsWith(jobTitle.toLowerCase())) {
        // If it does, slice the string to remove the job title prefix.
        // We use the original jobTitle's length to ensure we slice the correct number of characters.
        processedText = processedText.slice(jobTitle.length).trim();
    }
    // --- END OF NEW LOGIC ---

    // The rest of the formatting logic now runs on the cleaned `processedText`.
    const keywords = ['Responsibilities', 'Requirements', 'Qualifications', 'Duties', 'Skills', 'Benefits'];
    const splitRegex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const textWithDelimiters = processedText.replace(splitRegex, '|||$1');
    const sections = textWithDelimiters.split('|||').filter(section => section.trim() !== '');

    let htmlOutput = '';

    sections.forEach((section, index) => {
        if (index === 0 && !keywords.some(kw => section.toLowerCase().startsWith(kw.toLowerCase()))) {
            htmlOutput += `<p>${section.trim()}</p>`;
            return;
        }
        const matchingKeyword = keywords.find(kw => section.toLowerCase().startsWith(kw.toLowerCase()));
        if (matchingKeyword) {
            htmlOutput += `<b>${matchingKeyword}</b>`;
            let content = section.substring(matchingKeyword.length).trim().replace(/^[:\s-]+/, '');
            const listItems = content.split('.').map(item => item.trim()).filter(item => item.length > 0);

            if (listItems.length > 1) {
                htmlOutput += '<ul>';
                listItems.forEach(item => { htmlOutput += `<li>${item}</li>`; });
                htmlOutput += '</ul>';
            } else {
                htmlOutput += `<p>${content}</p>`;
            }
        } else {
            htmlOutput += `<p>${section.trim()}</p>`;
        }
    });

    return htmlOutput;
};


// The component now accepts `jobTitle` as a prop.
const StructuredDescription = ({ rawText, jobTitle }) => {
    // Pass both props to the formatting function.
    const formattedHtml = formatDescriptionToHtml(rawText, jobTitle);
    const sanitizedHtml = DOMPurify.sanitize(formattedHtml);

    return (
        <div
            className="job-description-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};

export default StructuredDescription;
