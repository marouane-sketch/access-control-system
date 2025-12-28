import React, { useEffect, useRef } from 'react';
import SlideTitle from './SlideTitle';
import { CheckCircle2, Code2, GitBranch } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ImplementationSlideProps {
    title: string;
    subtitle?: string;
    description?: string[];
    implementation: {
        phase: string;
        description: string;
        technologies: string[];
    }[];
}

const ImplementationSlide: React.FC<ImplementationSlideProps> = ({ title, subtitle, description, implementation }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const phasesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const phases = phasesRef.current?.querySelectorAll('.phase-item');
        if (!phases) return;

        gsap.fromTo(phases,
            { x: -60, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    scroller: "#presentation-container",
                    start: "top 60%",
                }
            }
        );

        // Animate checkmarks and numbers
        phases.forEach((phase, i) => {
            const checkmark = phase.querySelector('.phase-checkmark');
            const number = phase.querySelector('.phase-number');
            
            if (checkmark) {
                gsap.fromTo(checkmark,
                    { scale: 0, rotation: -180 },
                    {
                        scale: 1,
                        rotation: 0,
                        duration: 0.5,
                        delay: i * 0.15 + 0.5,
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: el,
                            scroller: "#presentation-container",
                            start: "top 60%",
                        }
                    }
                );
            }

            if (number) {
                gsap.fromTo(number,
                    { scale: 0 },
                    {
                        scale: 1,
                        duration: 0.4,
                        delay: i * 0.15 + 0.3,
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: el,
                            scroller: "#presentation-container",
                            start: "top 60%",
                        }
                    }
                );
            }
        });
    }, []);

    return (
        <div ref={containerRef} className="w-full max-w-6xl py-4">
            <div className="text-center mb-6">
                {subtitle && (
                    <p className="text-accent tracking-widest uppercase font-bold text-xs mb-2">{subtitle}</p>
                )}
                <SlideTitle className="!text-3xl md:!text-4xl">{title}</SlideTitle>
                {description?.map((para, i) => (
                    <p key={i} className="text-slate-500 text-sm mt-2 max-w-3xl mx-auto">{para}</p>
                ))}
            </div>

            <div ref={phasesRef} className="space-y-3">
                {implementation.map((phase, index) => (
                    <div
                        key={index}
                        className="phase-item opacity-0 relative pl-12 pr-4 py-4 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                        {/* Phase Number */}
                        <div className="phase-number absolute left-4 top-4 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                            {index + 1}
                        </div>

                        {/* Checkmark */}
                        <div className="phase-checkmark absolute left-4 top-4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <CheckCircle2 size={16} />
                        </div>

                        <div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">{phase.phase}</h3>
                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-2">{phase.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {phase.technologies.map((tech, techIndex) => (
                                    <span
                                        key={techIndex}
                                        className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors flex items-center gap-1"
                                    >
                                        <Code2 size={12} />
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Connecting Line */}
                        {index < implementation.length - 1 && (
                            <div className="absolute left-[27px] top-full w-0.5 h-3 bg-gradient-to-b from-blue-300 to-transparent"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImplementationSlide;

