import React, { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SlideProps {
    children: ReactNode;
    className?: string;
    id?: string;
    onEnter?: () => void;
}

const Slide: React.FC<SlideProps> = ({ children, className = '', id, onEnter }) => {
    const slideRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = slideRef.current;
        if (!el) return;

        ScrollTrigger.create({
            trigger: el,
            scroller: "#presentation-container",
            start: "top center",
            end: "bottom center",
            onEnter: () => {
                if (onEnter) onEnter();
                el.classList.add('is-visible');
            },
            onLeaveBack: () => {
                el.classList.remove('is-visible');
            }
        });
    }, [onEnter]);

    return (
        <section
            ref={slideRef}
            id={id}
            className={`h-screen w-full snap-start relative overflow-hidden flex flex-col justify-center items-center px-4 md:px-12 py-4 transition-all duration-[2000ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${className}`}
            role="region"
            aria-label={id}
        >
            {/* Background Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            {/* Subtle animated gradient overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none animate-gradient" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)', backgroundSize: '200% 200%' }}></div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
                {children}
            </div>
        </section>
    );
};

export default Slide;
