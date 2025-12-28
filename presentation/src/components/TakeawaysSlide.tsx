import React, { useEffect, useRef } from 'react';
import Slide from './Slide';
import SlideTitle from './SlideTitle';
import { CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TakeawaysSlideProps {
    id: string;
    title: string;
    subtitle?: string;
    takeaways?: string[];
    onEnter?: () => void;
}

const TakeawaysSlide: React.FC<TakeawaysSlideProps> = ({ id, title, subtitle, takeaways, onEnter }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const items = itemsRef.current?.querySelectorAll('.takeaway-item');
        if (!items) return;

        gsap.fromTo(items,
            { x: -40, opacity: 0, scale: 0.95 },
            {
                x: 0,
                opacity: 1,
                scale: 1,
                duration: 0.7,
                stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    scroller: "#presentation-container",
                    start: "top 60%",
                }
            }
        );

        // Animate checkmarks
        items.forEach((item, i) => {
            const checkmark = item.querySelector('.takeaway-checkmark');
            if (checkmark) {
                gsap.fromTo(checkmark,
                    { scale: 0, rotation: -180 },
                    {
                        scale: 1,
                        rotation: 0,
                        duration: 0.5,
                        delay: i * 0.12 + 0.3,
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
            <div ref={containerRef} className="max-w-5xl w-full py-4">
                <div className="text-center mb-8">
                    {subtitle && (
                        <p className="text-xs md:text-sm font-bold tracking-widest text-green-600 uppercase mb-2">{subtitle}</p>
                    )}
                    <SlideTitle className="!text-3xl md:!text-4xl">{title}</SlideTitle>
                </div>

                <div ref={itemsRef} className="space-y-4">
                    {takeaways?.map((takeaway, index) => (
                        <div
                            key={index}
                            className="takeaway-item opacity-0 flex items-start gap-4 p-5 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-green-500/50 transition-all shadow-lg hover:shadow-xl group"
                        >
                            <div className="takeaway-checkmark flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="text-sm md:text-base text-slate-700 leading-relaxed flex-1 pt-1.5">
                                {takeaway}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </Slide>
    );
};

export default TakeawaysSlide;

