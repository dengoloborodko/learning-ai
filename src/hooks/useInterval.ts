import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null): void {
    const savedCallback = useRef<() => void>(callback);

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval
    useEffect(() => {
        if (delay === null) return;

        const tick = () => {
            if (savedCallback.current) {
                savedCallback.current();
            }
        };

        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
} 