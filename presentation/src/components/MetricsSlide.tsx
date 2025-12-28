import React, { useEffect, useRef } from 'react';
import SlideTitle from './SlideTitle';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MetricsSlideProps {
    title: string;
    subtitle?: string;
    description?: string[];
    metrics: {
        label: string;
        value: string;
        trend?: 'up' | 'down' | 'stable';
        description: string;
    }[];
}

const MetricsSlide: React.FC<MetricsSlideProps> = ({ title, subtitle, description, metrics }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const metricsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const metricCards = metricsRef.current?.querySelectorAll('.metric-card');
        if (!metricCards) return;

        gsap.fromTo(metricCards,
            { y: 40, opacity: 0, scale: 0.9 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.7,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    scroller: "#presentation-container",
                    start: "top 60%",
                }
            }
        );

        // Animate value numbers
        metricCards.forEach((card, i) => {
            const valueEl = card.querySelector('.metric-value');
            if (valueEl) {
                gsap.fromTo(valueEl,
                    { scale: 0, rotation: -180 },
                    {
                        scale: 1,
                        rotation: 0,
                        duration: 0.6,
                        delay: i * 0.1 + 0.4,
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

    const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="text-green-500" size={20} />;
            case 'down':
                return <TrendingDown className="text-red-500" size={20} />;
            default:
                return <Minus className="text-blue-500" size={20} />;
        }
    };

    const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'down':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

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

            <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className="metric-card opacity-0 p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{metric.label}</h3>
                            <div className={`p-1 rounded-lg ${getTrendColor(metric.trend)}`}>
                                {getTrendIcon(metric.trend)}
                            </div>
                        </div>
                        <div className="metric-value mb-2">
                            <span className="text-2xl md:text-3xl font-black text-slate-900">{metric.value}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{metric.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MetricsSlide;

