import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SlideTitleProps {
    children: React.ReactNode;
    className?: string;
}

const SlideTitle: React.FC<SlideTitleProps> = ({ children, className = '' }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const el = titleRef.current;
        if (!el) return;

        // Animate title on mount/scroll
        gsap.fromTo(el,
            { opacity: 0, y: 30, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: "power3.out",
            }
        );
    }, []);

    return (
        <h2 
            ref={titleRef}
            className={`text-3xl md:text-4xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-500 text-shadow-sm ${className}`}
        >
            {children}
        </h2>
    );
};

export default SlideTitle;
