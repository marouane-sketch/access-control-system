import React, { useEffect, useRef } from 'react';
import Slide from './Slide';
import { ShieldCheck, ScanFace, Lock, Cpu } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface IntroSplitSlideProps {
    id: string;
    title: string;
    subtitle?: string;
    description?: string[];
    onEnter?: () => void;
}

const IntroSplitSlide: React.FC<IntroSplitSlideProps> = ({ id, title, subtitle, description, onEnter }) => {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const leftEl = leftRef.current;
        const rightEl = rightRef.current;
        const scannerEl = scannerRef.current;

        if (!leftEl || !rightEl) return;

        // Animations on scroll
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: leftEl,
                scroller: "#presentation-container",
                start: "top 70%",
            }
        });

        tl.fromTo(leftEl.querySelectorAll('.visual-node'),
            { scale: 0, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "back.out(1.7)" }
        )
            .fromTo(rightEl.querySelectorAll('.content-animate'),
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" },
                "-=0.6"
            );

        // Infinite Scanner Animation
        gsap.to(scannerEl, {
            top: "100%",
            duration: 3,
            repeat: -1,
            ease: "none",
            yoyo: true
        });

        // Floating nodes
        leftEl.querySelectorAll('.float-node').forEach((node, i) => {
            gsap.to(node, {
                y: 15,
                x: 10,
                duration: 2 + i,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });

    }, []);

    return (
        <Slide id={id} className="overflow-hidden font-sans" onEnter={onEnter}>
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>
                <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-indigo-200 to-transparent"></div>
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto px-4 md:px-8 gap-8 md:gap-12">

                {/* LEFT: VISUAL SECTION */}
                <div ref={leftRef} className="flex-1 relative flex items-center justify-center py-4">
                    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                        {/* Main Central Hub */}
                        <div className="visual-node relative z-20 p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-[0_0_80px_rgba(59,130,246,0.1)]">
                            <Lock size={48} className="md:w-16 md:h-16 text-slate-900 opacity-80" />

                            {/* Scanner Line */}
                            <div ref={scannerRef} className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-30"></div>
                        </div>

                        {/* Satellite Nodes */}
                        <div className="visual-node float-node absolute -top-6 -right-2 p-3 rounded-xl bg-white border border-slate-100 text-blue-600 shadow-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="visual-node float-node absolute bottom-0 -left-6 p-3 rounded-xl bg-white border border-slate-100 text-indigo-600 shadow-sm">
                            <ScanFace size={24} />
                        </div>
                        <div className="visual-node float-node absolute top-1/2 -right-12 p-2 rounded-lg bg-white border border-slate-100 text-slate-400 shadow-sm">
                            <Cpu size={16} />
                        </div>

                        {/* Orbiting Circles */}
                        <div className="visual-node absolute inset-0 border border-slate-100 rounded-full animate-[spin_20s_linear_infinite]"></div>
                        <div className="visual-node absolute -inset-10 border border-blue-500/5 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
                    </div>
                </div>

                {/* RIGHT: EXPLANATION SECTION */}
                <div ref={rightRef} className="flex-1 space-y-4">
                    <div className="space-y-2">
                        <span className="content-animate inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold tracking-[0.2em] text-[9px] uppercase">
                            Contexte & Défis
                        </span>
                        <h2 className="content-animate text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            {title}
                        </h2>
                        <p className="content-animate text-base md:text-lg font-medium text-blue-600 tracking-wide uppercase">
                            {subtitle}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {description?.map((text, i) => (
                            <div key={i} className="content-animate">
                                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-light border-l border-blue-200 pl-4">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="content-animate pt-10">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-[2px] bg-gradient-to-r from-blue-400 to-transparent"></div>
                            <span className="text-slate-400 text-sm font-mono tracking-widest uppercase">Solution Biométrique</span>
                        </div>
                    </div>
                </div>

            </div>
        </Slide>
    );
};

export default IntroSplitSlide;
