// src/components/StructuredDescription.js
import React from 'react';
import DOMPurify from 'dompurify';

// This function takes a raw text block and tries to intelligently format it into HTML.
const formatDescriptionToHtml = (rawText) => {
    if (!rawText || typeof rawText !== 'string') {
        return '<p class="info-message">No description available.</p>';
    }

    // Split the text into lines, and remove any empty lines.
    const lines = rawText.split(/\s*(?:\r\n|\n|\r)\s*/).filter(line => line.trim() !== '');

    let htmlOutput = '';
    let inList = false;

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();

        // Check for keywords that indicate a heading
        if (lowerLine.startsWith('responsibilities') || lowerLine.startsWith('requirements') || lowerLine.startsWith('qualifications')) {
            // If we were in a list, close it first.
            if (inList) {
                htmlOutput += '</ul>';
                inList = false;
            }
            htmlOutput += `<b>${line}</b>`;
        }
        // Check for lines that look like list items (common patterns)
        else if (line.match(/^(\s*•|\s*-|\s*\*|\d+\.\s*)/)) {
            // If we are not already in a list, start a new one.
            if (!inList) {
                htmlOutput += '<ul>';
                inList = true;
            }
            // Add the list item, stripping the bullet/number character.
            htmlOutput += `<li>${line.replace(/^(\s*•|\s*-|\s*\*|\d+\.\s*)/, '').trim()}</li>`;
        }
        // Treat all other lines as paragraphs
        else {
            // If we were in a list, close it.
            if (inList) {
                htmlOutput += '</ul>';
                inList = false;
            }
            htmlOutput += `<p>${line}</p>`;
        }
    });

    // If the text ends while still in a list, close the list tag.
    if (inList) {
        htmlOutput += '</ul>';
    }

    return htmlOutput;
};

const StructuredDescription = ({ rawText }) => {
    // 1. Format the raw text into a structured HTML string.
    const formattedHtml = formatDescriptionToHtml(rawText);

    // 2. Sanitize the newly created HTML to ensure it's safe.
    const sanitizedHtml = DOMPurify.sanitize(formattedHtml);

    // 3. Render it.
    return (
        <div
            className="job-description-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};

export default StructuredDescription;
