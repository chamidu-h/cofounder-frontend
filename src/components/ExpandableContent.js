// src/components/ExpandableContent.js
import React, { useState, useRef, useEffect } from 'react';

const ExpandableContent = ({ children, collapsedHeight = '120px' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        // Check if the content is actually taller than the collapsed height
        if (contentRef.current && contentRef.current.scrollHeight > parseInt(collapsedHeight, 10)) {
            setIsOverflowing(true);
        } else {
            setIsOverflowing(false);
        }
    }, [children, collapsedHeight]);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="expandable-container">
            <div
                ref={contentRef}
                className={`expandable-content ${isExpanded ? 'expanded' : ''}`}
                style={{ '--collapsed-height': collapsedHeight }}
            >
                {children}
            </div>
            {isOverflowing && (
                <button onClick={toggleExpand} className="read-more-button">
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};

export default ExpandableContent;
