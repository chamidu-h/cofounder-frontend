import React from 'react';
import DOMPurify from 'dompurify';

const formatDescriptionToHtml = (rawText, jobTitle) => {
  if (!rawText || typeof rawText !== 'string') {
    return '<p class="info-message">No description available.</p>';
  }
  let processedText = rawText.trim();
  if (jobTitle && processedText.toLowerCase().startsWith(jobTitle.toLowerCase())) {
    processedText = processedText.slice(jobTitle.length).trim();
  }
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
      htmlOutput += `<b class="accent-keyword">${matchingKeyword}</b>`;
      let content = section.substring(matchingKeyword.length).trim().replace(/^[:\s-]+/, '');
      const listItems = content.split('.').map(item => item.trim()).filter(item => item.length > 0);
      if (listItems.length > 1) {
        htmlOutput += '<ul class="accent-list">';
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

const StructuredDescription = ({ rawText, jobTitle }) => {
  const formattedHtml = formatDescriptionToHtml(rawText, jobTitle);
  const sanitizedHtml = DOMPurify.sanitize(formattedHtml);
  return (
    <div
      className="job-description-content accent-description"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default StructuredDescription;
