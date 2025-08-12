import { useState, useRef, useEffect } from "react";

export default function useToggleHeight(isExpanded: boolean) {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<string | number>(
        isExpanded ? "auto" : 0
    );

    useEffect(() => {
        if (ref.current) {
            if (isExpanded) {
                setHeight(ref.current.scrollHeight);
                const timeout = setTimeout(() => setHeight("auto"), 300);
                return () => clearTimeout(timeout);
            } else {
                setHeight(ref.current.scrollHeight);
                requestAnimationFrame(() => setHeight(0));
            }
        }
    }, [isExpanded]);

    return { ref, height };
}
