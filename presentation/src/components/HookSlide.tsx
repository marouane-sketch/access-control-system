import React, { useEffect, useRef } from 'react';
import Slide from './Slide';
import SlideTitle from './SlideTitle';
import { AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HookSlideProps {
    id: string;
    title: string;
    subtitle?: string;
    description?: string[];
    hookStatistic?: {
        value: string;
        label: string;
        description: string;
    };
    onEnter?: () => void;
}

const HookSlide: React.FC<HookSlideProps> = ({ id, title, subtitle, description, hookStatistic, onEnter }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const statRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Animate statistic with counter effect
        if (statRef.current) {
            const valueEl = statRef.current.querySelector('.stat-value');
            if (valueEl && hookStatistic) {
                gsap.fromTo(valueEl,
                    { scale: 0, rotation: -180, opacity: 0 },
                    {
                        scale: 1,
                        rotation: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: el,
                            scroller: "#presentation-container",
                            start: "top 60%",
                        }
                    }
                );
            }
        }

        // Animate description
        if (descRef.current) {
            gsap.fromTo(descRef.current.querySelectorAll('p'),
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out",
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: el,
                        scroller: "#presentation-container",
                        start: "top 60%",
                    }
                }
            );
        }
    }, [hookStatistic]);

    return (
        <Slide id={id} className="" onEnter={onEnter}>
            <div ref={containerRef} className="max-w-5xl w-full text-center py-4">
                {subtitle && (
                    <p className="text-xs md:text-sm font-bold tracking-widest text-red-600 uppercase mb-4">{subtitle}</p>
                )}
                <SlideTitle className="!text-3xl md:!text-5xl !mb-8">{title}</SlideTitle>

                {hookStatistic && (
                    <div ref={statRef} className="mb-12">
                        <div className="inline-flex flex-col items-center p-8 rounded-3xl bg-white/95 backdrop-blur-sm border-4 border-red-500/30 shadow-2xl">
                            <div className="stat-value mb-4">
                                <span className="text-7xl md:text-9xl font-black text-red-600 leading-none">
                                    {hookStatistic.value}
                                </span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{hookStatistic.label}</p>
                            <p className="text-sm md:text-base text-slate-600 max-w-2xl">{hookStatistic.description}</p>
                        </div>
                    </div>
                )}

                <div ref={descRef} className="space-y-4 text-left max-w-4xl mx-auto">
                    {description?.map((para, i) => (
                        <p key={i} className="text-base md:text-lg text-slate-700 leading-relaxed opacity-0">
                            {para}
                        </p>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-red-600">
                    <AlertTriangle size={24} />
                    <span className="text-sm font-bold uppercase tracking-wider">Sécurité Critique</span>
                </div>
            </div>
        </Slide>
    );
};

export default HookSlide;

