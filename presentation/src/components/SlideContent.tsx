import React from 'react';

interface SlideContentProps {
    children: React.ReactNode;
    className?: string;
}

const SlideContent: React.FC<SlideContentProps> = ({ children, className = '' }) => {
    return (
        <div className={`text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-4xl mx-auto ${className}`}>
            {children}
        </div>
    );
};

export default SlideContent;
