"use client";

import * as React from "react";
import Tooltip from "@/components/ui/tooltip";

type TruncateTooltipProps = {
  title: string;
  children: React.ReactNode;
};

export default function TruncateTooltip({ title, children }: TruncateTooltipProps) {
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const target = wrapper.firstElementChild as HTMLElement | null;
    if (!target) return;

    const check = () => {
      setIsOverflowing(
        target.scrollWidth > target.clientWidth || target.scrollHeight > target.clientHeight,
      );
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const content = (
    <span ref={wrapperRef} className="inline-flex min-w-0 w-full">
      {children}
    </span>
  );

  if (!isMounted) {
    return content;
  }

  return (
    <Tooltip title={title} placement="top" arrow disableHoverListener={!isOverflowing}>
      {content}
    </Tooltip>
  );
}
