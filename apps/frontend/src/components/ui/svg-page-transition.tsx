'use client';

import { useEffect } from 'react';

type SvgPageTransitionProps = {
  onComplete?: () => void;
};

export function SvgPageTransition({ onComplete }: SvgPageTransitionProps) {
  useEffect(() => {
    const completeTimer = window.setTimeout(() => onComplete?.(), 1700);
    return () => window.clearTimeout(completeTimer);
  }, [onComplete]);

  return (
    <div className="ghub-login-transition" aria-live="polite" aria-label="กำลังเข้าสู่ระบบ">
      <div className="ghub-login-transition__surface">
        <svg
          viewBox="0 0 2453 2535"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ghubTransitionSoft" x1="180" y1="180" x2="2280" y2="2380" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e5f7ff" />
              <stop offset="0.52" stopColor="#bfdbfe" />
              <stop offset="1" stopColor="#dbeafe" />
            </linearGradient>
            <linearGradient id="ghubTransitionBrand" x1="120" y1="2300" x2="2320" y2="180" gradientUnits="userSpaceOnUse">
              <stop stopColor="#05245f" />
              <stop offset="0.36" stopColor="#0b63f6" />
              <stop offset="0.72" stopColor="#22b7f5" />
              <stop offset="1" stopColor="#1478ff" />
            </linearGradient>
          </defs>
          <path
            pathLength={1}
            d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
            stroke="url(#ghubTransitionSoft)"
            className="ghub-login-transition__path ghub-login-transition__path--soft"
          />
          <path
            pathLength={1}
            d="M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012"
            stroke="url(#ghubTransitionBrand)"
            className="ghub-login-transition__path ghub-login-transition__path--brand"
          />
        </svg>
      </div>
    </div>
  );
}
