import React, { useEffect, useRef } from 'react';
import Slide from './Slide';
import SlideTitle from './SlideTitle';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { LucideIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface GridItem {
    icon: LucideIcon;
    title: string;
    desc: string;
}

interface GridSlideProps {
    id: string;
    title: string;
    subtitle?: string;
    gridItems: GridItem[];
    onEnter?: () => void;
}

const GridSlide: React.FC<GridSlideProps> = ({ id, title, subtitle, gridItems, onEnter }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const items = gridRef.current?.querySelectorAll('.grid-item');
        if (!items) return;

        gsap.fromTo(items,
            { y: 50, opacity: 0, scale: 0.9 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.7,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    scroller: "#presentation-container",
                    start: "top 60%",
                }
            }
        );

        // Animate icons
        items.forEach((item, i) => {
            const iconContainer = item.querySelector('.icon-container');
            if (iconContainer) {
                gsap.fromTo(iconContainer,
                    { rotation: -180, scale: 0 },
                    {
                        rotation: 0,
                        scale: 1,
                        duration: 0.6,
                        delay: i * 0.1 + 0.3,
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
        <Slide id={id} className="" onEnter={onEnter}>
            <div ref={containerRef} className="max-w-6xl w-full py-4">
                <div className="text-center mb-6">
                    {subtitle && <p className="text-accent tracking-widest uppercase font-bold text-xs mb-2">{subtitle}</p>}
                    <SlideTitle className="!text-3xl md:!text-4xl">{title}</SlideTitle>
                </div>
                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gridItems.map((item, i) => (
                        <div key={i} className="grid-item opacity-0 p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-blue-500/50 transition-all group shadow-lg hover:shadow-xl hover:-translate-y-1">
                            <div className="icon-container mb-3 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:from-blue-500 group-hover:to-indigo-600 transition-all shadow-md group-hover:scale-110">
                                <item.icon className="text-blue-600 group-hover:text-white transition-colors" size={20} />
                            </div>
                            <h3 className="text-base font-bold mb-2 text-slate-900">{item.title}</h3>
                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Slide>
    );
};

export default GridSlide;

