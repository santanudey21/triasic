import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [startPoint, setStartPoint] = useState(0);
  const [pullChange, setPullChange] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pullThreshold = 120; // Pixels to pull down to trigger refresh
  const maxPull = 200;

  const initTouch = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartPoint(e.touches[0].clientY);
    }
  };

  const touchMove = (e: React.TouchEvent) => {
    if (!startPoint) return;
    const touchY = e.touches[0].clientY;
    const diff = touchY - startPoint;

    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Prevent default only if we are pulling down at the top
      // Note: e.preventDefault() in React passive events is tricky, rely on CSS overscroll-behavior
      setPullChange(Math.min(diff * 0.5, maxPull)); // Damping
    }
  };

  const touchEnd = async () => {
    if (pullChange > pullThreshold) {
      setRefreshing(true);
      setPullChange(60); // Keep spinner visible
      await onRefresh();
      setRefreshing(false);
    }
    setStartPoint(0);
    setPullChange(0);
  };

  useEffect(() => {
    if (!refreshing) {
      setPullChange(0);
    }
  }, [refreshing]);

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-y-auto overscroll-contain no-scrollbar"
      onTouchStart={initTouch}
      onTouchMove={touchMove}
      onTouchEnd={touchEnd}
      style={{ 
        scrollBehavior: 'smooth' 
      }}
    >
      <div 
        className="absolute top-0 left-0 w-full flex justify-center items-center pointer-events-none transition-transform duration-200 ease-out z-10"
        style={{ 
          height: '60px',
          transform: `translateY(${pullChange - 60}px)`,
          opacity: pullChange > 10 ? 1 : 0
        }}
      >
        <div className="bg-md-sys-surface shadow-md rounded-full p-2 border border-md-sys-outline/10">
            <Loader2 
                className={`text-md-sys-primary ${refreshing ? 'animate-spin' : ''}`} 
                size={24} 
                style={{ transform: `rotate(${pullChange * 2}deg)` }}
            />
        </div>
      </div>
      
      <div 
        className="transition-transform duration-200 ease-out min-h-full"
        style={{ transform: `translateY(${pullChange}px)` }}
      >
        {children}
      </div>
    </div>
  );
};