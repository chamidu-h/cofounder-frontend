// src/components/StructuredDescription.js
import React from 'react';
import DOMPurify from 'dompurify';

// This function takes a raw text block and intelligently formats it into HTML.
const formatDescriptionToHtml = (rawText) => {
    if (!rawText || typeof rawText !== 'string') {
        return '<p class="info-message">No description available.</p>';
    }

    // --- NEW, MORE ROBUST LOGIC ---

    // 1. Define keywords that signal the start of a new section.
    // The regex will look for these words (case-insensitive).
    const keywords = ['Responsibilities', 'Requirements', 'Qualifications', 'Duties', 'Skills', 'Benefits'];
    const splitRegex = new RegExp(`(${keywords.join('|')})`, 'gi');

    // 2. Insert a unique delimiter before each keyword to create split points.
    // We use '|||' as it's unlikely to appear in the text naturally.
    const textWithDelimiters = rawText.replace(splitRegex, '|||$1');
    const sections = textWithDelimiters.split('|||').filter(section => section.trim() !== '');

    let htmlOutput = '';

    // 3. Process each section.
    sections.forEach((section, index) => {
        // The very first section before any keywords is the main description.
        if (index === 0 && !keywords.some(kw => section.toLowerCase().startsWith(kw.toLowerCase()))) {
            htmlOutput += `<p>${section.trim()}</p>`;
            return;
        }

        // For sections that start with a keyword...
        const matchingKeyword = keywords.find(kw => section.toLowerCase().startsWith(kw.toLowerCase()));

        if (matchingKeyword) {
            // Make the keyword a bold heading.
            htmlOutput += `<b>${matchingKeyword}</b>`;

            // The rest of the section is the content.
            let content = section.substring(matchingKeyword.length).trim();
            // Remove leading colons or other punctuation.
            content = content.replace(/^[:\s-]+/, '');

            // Assume sentences ending with a period are list items. This is a heuristic.
            const listItems = content.split('.')
                                     .map(item => item.trim())
                                     .filter(item => item.length > 0);

            if (listItems.length > 1) {
                htmlOutput += '<ul>';
                listItems.forEach(item => {
                    htmlOutput += `<li>${item}</li>`;
                });
                htmlOutput += '</ul>';
            } else {
                // If it's just one block, treat it as a paragraph.
                htmlOutput += `<p>${content}</p>`;
            }
        } else {
            // If a section doesn't start with a known keyword, treat it as a paragraph.
            htmlOutput += `<p>${section.trim()}</p>`;
        }
    });

    return htmlOutput;
};

const StructuredDescription = ({ rawText }) => {
    // 1. Format the raw text into a structured HTML string using our new logic.
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
