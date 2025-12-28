import React, { useEffect, useRef } from 'react';
import Slide from './Slide';
import SlideTitle from './SlideTitle';
import { AlertCircle, Target, Lightbulb, BookOpen, XCircle, TrendingUp } from 'lucide-react';
import gsap from 'gsap';

interface ContentSlideProps {
    id: string;
    title: string;
    subtitle?: string;
    description?: string[];
    bullets?: string[];
    onEnter?: () => void;
}

const getIconForSlide = (id: string) => {
    if (id.includes('problem') || id.includes('vulnerability')) return AlertCircle;
    if (id.includes('why-now') || id.includes('urgency')) return TrendingUp;
    if (id.includes('context') || id.includes('evolution')) return Target;
    if (id.includes('related') || id.includes('work')) return BookOpen;
    if (id.includes('limitation') || id.includes('challenge')) return XCircle;
    if (id.includes('future') || id.includes('research')) return Lightbulb;
    return Target;
};

const ContentSlide: React.FC<ContentSlideProps> = ({ id, title, subtitle, description, bullets, onEnter }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);
    const Icon = getIconForSlide(id);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Animate icon
        if (iconRef.current) {
            gsap.fromTo(iconRef.current,
                { scale: 0, rotation: -180, opacity: 0 },
                {
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: el,
                        scroller: "#presentation-container",
                        start: "top 70%"
                    }
                }
            );
        }

        const items = el.querySelectorAll('.animate-item');
        
        gsap.fromTo(items,
            { y: 40, opacity: 0, scale: 0.95 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.9,
                stagger: 0.12,
                ease: "power3.out",
                delay: 0.2,
                scrollTrigger: {
                    trigger: el,
                    scroller: "#presentation-container",
                    start: "top 70%"
                }
            }
        );

        // Animate bullets with a different effect
        const bulletItems = el.querySelectorAll('li');
        if (bulletItems.length > 0) {
            gsap.fromTo(bulletItems,
                { x: -30, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: "power2.out",
                    delay: 0.5,
                    scrollTrigger: {
                        trigger: el,
                        scroller: "#presentation-container",
                        start: "top 70%"
                    }
                }
            );
        }
    }, []);

    return (
        <Slide id={id} className="" onEnter={onEnter}>
            <div ref={containerRef} className="max-w-5xl w-full py-4">
                {/* Icon Header */}
                <div className="flex items-start gap-6 mb-8">
                    <div ref={iconRef} className="flex-shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl">
                            <Icon size={32} className="md:w-10 md:h-10" />
                        </div>
                    </div>
                    <div className="flex-1">
                        {subtitle && (
                            <h3 className="animate-item text-xs md:text-sm font-bold tracking-[0.2em] text-blue-600 uppercase mb-3 opacity-0">{subtitle}</h3>
                        )}
                        <div className="animate-item opacity-0">
                            <SlideTitle className="!text-slate-900 !mb-0 !text-3xl md:!text-4xl">{title}</SlideTitle>
                        </div>
                    </div>
                </div>

                {/* Content Cards */}
                <div className="space-y-4 mb-6">
                    {description?.map((para, i) => (
                        <div key={i} className="animate-item opacity-0 p-5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                            <p className="text-base md:text-lg text-slate-700 font-normal leading-relaxed">
                                {para}
                            </p>
                        </div>
                    ))}
                </div>

                {bullets && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {bullets.map((bullet, i) => (
                            <div key={i} className="animate-item opacity-0 p-4 rounded-lg bg-white/70 backdrop-blur-sm border border-slate-200 shadow-md hover:shadow-lg transition-all hover:border-blue-500/50">
                                <li className="flex items-start list-none">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 mt-0.5">
                                        <span className="text-white text-xs font-bold">{i + 1}</span>
                                    </div>
                                    <span className="text-sm md:text-base text-slate-700 leading-relaxed flex-1">{bullet}</span>
                                </li>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Slide>
    );
};

export default ContentSlide;
