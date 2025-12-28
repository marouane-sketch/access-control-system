import React, { useEffect, useRef } from 'react';
import Slide from './Slide';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface DividerSlideProps {
    id: string;
    sectionTitle?: string;
    subtitle?: string;
    sectionNumber?: number;
    onEnter?: () => void;
}

const DividerSlide: React.FC<DividerSlideProps> = ({ id, sectionTitle, subtitle, sectionNumber, onEnter }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    const numberRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Animate section number
        if (numberRef.current) {
            gsap.fromTo(numberRef.current,
                { scale: 0, rotation: -360 },
                {
                    scale: 1,
                    rotation: 0,
                    duration: 1,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: el,
                        scroller: "#presentation-container",
                        start: "top 70%",
                    }
                }
            );
        }

        // Animate title
        if (titleRef.current) {
            gsap.fromTo(titleRef.current,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: 0.3,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        scroller: "#presentation-container",
                        start: "top 70%",
                    }
                }
            );
        }
    }, []);

    return (
        <Slide id={id} className="" onEnter={onEnter}>
            <div ref={containerRef} className="max-w-4xl w-full text-center py-4">
                {sectionNumber && (
                    <div ref={numberRef} className="mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl">
                            <span className="text-4xl font-black">{sectionNumber}</span>
                        </div>
                    </div>
                )}
                <div ref={titleRef} className="opacity-0">
                    {sectionTitle && (
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tight">
                            {sectionTitle}
                        </h2>
                    )}
                    {subtitle && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-slate-300"></div>
                            <p className="text-xl md:text-2xl font-bold text-slate-600 uppercase tracking-wider">
                                {subtitle}
                            </p>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-slate-300"></div>
                        </div>
                    )}
                </div>
            </div>
        </Slide>
    );
};

export default DividerSlide;

