// src/components/ExpandableContent.js
import React, { useState, useRef, useEffect } from 'react';

const ExpandableContent = ({ children, collapsedHeight = '120px' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [actualHeight, setActualHeight] = useState('auto');
    const contentRef = useRef(null);

    useEffect(() => {
        const checkOverflow = () => {
            if (contentRef.current) {
                const element = contentRef.current;
                const collapsedHeightPx = parseInt(collapsedHeight, 10);
                const scrollHeight = element.scrollHeight;
                
                // Check if content actually overflows
                if (scrollHeight > collapsedHeightPx) {
                    setIsOverflowing(true);
                    setActualHeight(`${scrollHeight}px`);
                } else {
                    setIsOverflowing(false);
                    setActualHeight('auto');
                }
            }
        };

        // Initial check
        checkOverflow();

        // Check again after a short delay to ensure content is fully rendered
        const timeoutId = setTimeout(checkOverflow, 100);

        // Optional: Add resize observer for dynamic content
        const resizeObserver = new ResizeObserver(checkOverflow);
        if (contentRef.current) {
            resizeObserver.observe(contentRef.current);
        }

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
        };
    }, [children, collapsedHeight]);

    const toggleExpand = () => {
        setIsExpanded(prevExpanded => !prevExpanded);
    };

    return (
        <div className="expandable-container">
            <div
                ref={contentRef}
                className={`expandable-content ${isExpanded ? 'expanded' : ''}`}
                style={{
                    '--collapsed-height': collapsedHeight,
                    maxHeight: isExpanded ? actualHeight : collapsedHeight,
                    overflow: 'hidden',
                    transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                }}
            >
                {children}
                
                {/* Fade overlay when collapsed and overflowing */}
                {!isExpanded && isOverflowing && (
                    <div 
                        className="content-fade-overlay"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '60px',
                            background: 'linear-gradient(to bottom, transparent, var(--color-surface))',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}
                    />
                )}
            </div>
            
            {isOverflowing && (
                <button 
                    onClick={toggleExpand} 
                    className="read-more-button"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Collapse content' : 'Expand content'}
                >
                    {isExpanded ? 'Read Less' : 'Read More'}
                </button>
            )}
        </div>
    );
};

export default ExpandableContent;
