import React, { useEffect, useRef } from 'react';
import SlideTitle from './SlideTitle';
import gsap from 'gsap';

interface ScreenshotSlideProps {
    title: string;
    subtitle?: string;
    description?: string[];
    imageSrc: string;
    imageAlt: string;
    imageCaption?: string;
    reverse?: boolean;
}

const ScreenshotSlide: React.FC<ScreenshotSlideProps> = ({ title, subtitle, description, imageSrc, imageAlt, imageCaption, reverse = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: el,
                scroller: "#presentation-container",
                start: "top 60%",
            }
        });

        // Animate text with stagger for paragraphs
        tl.fromTo(textRef.current,
            { x: reverse ? 50 : -50, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
            }
        );

        // Animate paragraphs with stagger
        const paragraphs = textRef.current?.querySelectorAll('p');
        if (paragraphs) {
            gsap.fromTo(paragraphs,
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "power2.out",
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: el,
                        scroller: "#presentation-container",
                        start: "top 60%",
                    }
                }
            );
        }

        // Animate image with more sophisticated effects
        tl.fromTo(imgRef.current,
            { scale: 0.9, opacity: 0, y: 40, rotation: reverse ? -2 : 2 },
            {
                scale: 1,
                opacity: 1,
                y: 0,
                rotation: 0,
                duration: 1.2,
                ease: "power3.out",
            },
            "-=0.8"
        );

        // Animate image border glow
        const imageBorder = imgRef.current?.querySelector('.absolute');
        if (imageBorder) {
            gsap.to(imageBorder, {
                opacity: 0.5,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                scrollTrigger: {
                    trigger: el,
                    scroller: "#presentation-container",
                    start: "top 60%",
                }
            });
        }

    }, [reverse]);

    return (
        <div ref={containerRef} className={`flex flex-col md:flex-row items-center gap-6 lg:gap-8 w-full ${reverse ? 'md:flex-row-reverse' : ''}`}>

            <div ref={textRef} className="flex-1 text-left opacity-0 py-2">
                {subtitle && (
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="h-px w-6 bg-blue-600"></div>
                        <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">{subtitle}</span>
                    </div>
                )}
                <SlideTitle className="!text-2xl md:!text-3xl !mb-3 !text-slate-900">{title}</SlideTitle>

                <div className="space-y-2 text-slate-500 text-sm md:text-base leading-relaxed">
                    {description?.map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
            </div>

            <div ref={imgRef} className="flex-1 relative group opacity-0 w-full max-h-[60vh]">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-xl opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 shadow-2xl bg-white group-hover:border-blue-500/50 transition-all duration-300 max-h-[60vh]">
                    <div className="h-5 bg-gradient-to-r from-slate-100 to-slate-50 flex items-center px-3 space-x-1.5 border-b border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        className="w-full h-auto block max-h-[calc(60vh-1.25rem)] object-contain group-hover:scale-[1.01] transition-transform duration-500"
                    />
                </div>
                {imageCaption && (
                    <p className="mt-2 text-[9px] uppercase tracking-widest font-bold text-slate-400 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">{imageCaption}</p>
                )}
            </div>
        </div>
    );
};

export default ScreenshotSlide;
