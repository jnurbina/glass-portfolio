"use client";

import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo

interface LaughingManProps {
  onLoadComplete: () => void;
}

const LaughingMan: React.FC<LaughingManProps> = ({ onLoadComplete }) => {
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState('');
  const [smileProgress, setSmileProgress] = useState(0); // Added state for smile progress

  const quotes = useMemo(() => [ // Use useMemo to prevent redefining array on each render
    // "Your effort to remain what you are is what limits you.",
    "Anonymity as armor. Identity as a weapon.",
    "I am not what you see.",
    "I remember the future.",
    "Time is the substance I am made of.",
    // "No one is free. Even the birds are chained to the sky.",
    // "To deny our own impulses is to deny the very thing that makes us human.",
    // "I am a forest, and a night of dark trees.",
  ], []);

  useEffect(() => {
    // Select random quote on mount
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);

    const loadingDuration = 4000; // ms
    const intervalTime = 50; // ms
    const totalIntervals = loadingDuration / intervalTime;
    const increment = 1 / totalIntervals;
    let currentProgress = 0;

    // Interval for gradual smile
    const smileInterval = setInterval(() => {
      currentProgress += increment;
      setSmileProgress(Math.min(currentProgress, 1)); // Cap at 1
      if (currentProgress >= 1) {
        clearInterval(smileInterval);
      }
    }, intervalTime);

    // Timer to end loading state
    const loadingTimer = setTimeout(() => {
      setLoading(false);
      onLoadComplete();
      setSmileProgress(1); // Ensure smile is full at the end
      clearInterval(smileInterval); // Clear interval if timer finishes first
    }, loadingDuration);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(smileInterval); // Cleanup interval on unmount
    };
  }, [onLoadComplete, quotes]);

  // Fixed positioning for the Laughing Man logo
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(5, 10, 25)', // Match your background start color
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    transition: 'opacity 0.5s ease-out',
    opacity: loading ? 1 : 0,
    pointerEvents: loading ? 'all' : 'none',
  } as React.CSSProperties;

  return (
    <div style={containerStyle}>
      {/* Container size matches SVG */}
      <div style={{ position: 'relative', width: '1024px', height: '1024px' }}>
        <svg viewBox="0 0 1024 1024" width="1024" height="1024">
          {/* Define the circular path for the text - adjusted for 1024 viewbox */}
          <defs>
            <path
              id="textCirclePath"
              d="M 512, 512 m -196, 0 a 196,196 0 1,1 392,0 a 196,196 0 1,1 -392,0" // Reduced radius to 196
              fill="none"
            />
            {/* Removed mask definition */}
          </defs>

          {/* Outer ring border - Removed mask */}
          <circle
            cx="512" cy="512" r="240" // Reduced radius to 240
            stroke="#00defe"
            strokeWidth="8" // Increased stroke width for larger size
            fill="none"
            // Apply animation directly via style if preferred over CSS class
            style={{ transformOrigin: '512px 512px', animation: 'spin-clockwise 20s linear infinite' }} // Updated origin
            // Removed mask attribute
          />

          {/* Wrap text in a group and apply clockwise spin - Removed mask */}
          <g style={{ transformOrigin: '512px 512px', animation: 'spin-clockwise 20s linear infinite' }}> {/* Removed mask attribute */}
            {/* Curved Text */}
            {/* Using dominant-baseline and text-anchor for better alignment */}
            <text
              fill="#00defe"
              fontSize="48" // Slightly larger font size
              letterSpacing="5" // Increased letter spacing
              style={{ textTransform: 'uppercase' }}
              dy="-2" // Fine-tune vertical offset if needed
            >
              <textPath
                 xlinkHref="#textCirclePath"
                 startOffset="50%" // Start text at the top-middle
                 textAnchor="middle"
                 dominantBaseline="middle" // Align text vertically centered on the path
               >
                 {quote} {/* Display random quote */}
               </textPath>
             </text>
            </g>
  
             {/* Center face container */}
             <g style={{ transformOrigin: '512px 512px', animation: 'spin-counter-clockwise 15s linear infinite' }}> {/* Updated origin */}
                {/* Foreground Face Paths - Rendered on top of background paths */}
              <path
                transform="translate(301.5 326.8) scale(0.8)" // Recalculated transform for scale 0.8
                fill="#00defe" // Actual face color
                fillRule="evenodd"
              /> {/* Close the first path */}

                {/* Start of the second path */}
              <path
                transform="translate(301.5 326.8) scale(0.8)" // Recalculated transform for scale 0.8
                fill="#00defe"
                fillRule="evenodd"
                d="M129.24188 212.237h328.785c4.73947 17.09447 1.68332 35.66474.42514 53.20777-4.23938 35.37921-18.87696 69.47809-42.70314 96.07923-9.32381 10.14506-19.92311 19.24211-30.79325 27.69558-31.1972 21.90747-69.46918 33.01043-107.55608 31.22811-16.92917 1.13842-33.63406-1.52451-49.96767-5.74369-13.6697-5.14206-29.46051-9.68717-42.94533-17.81151-13.65954-7.55005-25.15433-17.61793-35.9699-28.89034-28.31383-28.40201-44.5785-67.56895-46.80053-107.42537-.8584-15.43795-.26755-30.907-.28824-46.35878 1.40645-3.22521 27.814-1.981 27.814-1.981zm153.963 102.991c-33.3296-1.30136-69.18901 10.06062-89.96355 37.36016-6.57976 7.87325-3.27495 23.51727 5.04818 24.03784 5.59166.85279 7.68797-1.86147 10.25558-3.961 3.51782-2.80602 3.54715-2.93294 6.79121-5.941 2.58485-2.63814 2.976-2.7367 6.28358-5.943 2.28957-2.16912 11.58356-9.46986 14.899-11.883 5.41399-2.7937 5.71911-2.80747 10.76521-3.961 6.6723-2.04848 7.36322-1.9027 11.98959-2.62645 6.01345-.68116 9.12665-.96363 13.72914-1.33455h27.08806c5.84106 1.81101 5.83339 2.08398 10.60442 3.961 5.67135 1.95396 5.32145 2.11207 10.09379 3.961 5.01804 2.0067 5.07982 2.22834 10.08505 4.24786 4.82158 2.93649 4.86549 3.12045 7.79395 5.65514 3.85854 2.87814 3.98107 3.03785 6.954 5.941 4.1747 4.94066 4.21062 5.14028 10.09379 9.904 4.69339 4.48688 8.48576 2.24253 11.17815.57373 3.79657-3.19828 7.26784-15.7492 2.10691-22.54848-15.08596-23.13135-43.74611-32.11331-69.69843-36.2459-9.17372-1.68208-9.75483-1.34325-16.09763-1.19735zm-82.446-74.272c-13.94976-2.10442-31.24567 7.88604-26.7985 23.94548 2.9178 5.39913 5.75583 9.65761 9.9125 11.54673 2.87688 1.98735 5.82845 3.90001 11.46389 3.12879 5.13995.4085 7.13602-2.32686 11.38211-2.81221 3.16766-2.41632 7.26307-4.45086 9.57532-9.22353 6.5296-13.81312-6.78559-24.3187-15.53532-26.58526zm175.817 0c-14.95224-3.609-32.25732 8.34241-27.813 24.758 2.55783 7.97822 7.57814 11.10578 14.54142 13.4327 7.09548.23067 7.04524.20037 13.27158-1.5497 5.94735-1.81196 7.12019-2.12327 10.60342-3.961 6.99375-6.85156 8.3947-24.40647-4.24722-29.87049-2.00949-1.16303-4.1555-2.07731-6.3562-2.80951z"
                clipRule="evenodd"
              />
             <path
               transform="translate(301.5 326.8) scale(0.8)" // Recalculated transform for scale 0.8
               fill="#00defe"
               d="M258.12488 0h39.603c21.45986 4.11687 45.46927 6.08013 66.58222 15.61542 22.32589 7.57575 43.17644 21.63522 61.59521 35.33952 17.25348 15.508 33.97926 32.03233 46.45365 51.87489 12.72487 18.56104 19.86414 40.02858 25.53122 61.54555 16.36754 11.82116 41.90121 34.84625 19.59131 54.99752-24.0347 16.32774-8.64045 45.86272-17.65353 69.02847-17.6138 85.3762-89.57167 158.53556-176.96027 170.723-89.39372 17.22114-191.46069-22.18341-235.39181-104.29715-3.70979-26.15019-33.51035-28.70853-51.61488-40.50591-36.23397-23.86703-48.7865-79.37619-19.93072-113.77643 11.29992-21.67919 41.61156-24.24137 50.0966-46.79429 6.71983-26.96931 21.74329-51.47138 39.15023-72.73371 13.94226-17.17139 31.45651-31.34866 49.57956-44.15248 21.43737-12.25855 43.98229-25.59185 68.79267-28.93259C234.60198 1.62929 248.6644 4.65657 258.12488 0Zm-87.127 45.6079C125.67063 72.82277 88.655 115.97879 76.45924 168.21663c-15.39472 16.55996-46.6793 26.67204-57.63245 52.01878-15.68355 34.1865 3.56957 79.90783 40.84443 89.23867 27.37995-.30454 34.96039 21.68395 44.58184 42.73008 14.05368 19.28021 28.60165 38.63361 47.60903 52.20874 20.65848 15.34639 43.46003 26.49107 67.72557 33.78104 25.82023 8.45465 52.95356 8.4169 79.8502 7.97106 22.2039-2.29368 45.41111-7.33057 65.83145-16.24569 22.54723-9.28424 41.76898-23.82889 60.17857-39.27731 14.30997-15.73106 27.3467-32.4319 38.26622-50.84498 21.58129-37.89474 28.30781-82.54135 26.08878-125.63802 27.4257 1.88326 23.4113-28.28648 1.09377-32.6128-13.97674-13.80831-9.94512-37.80832-21.30987-54.36557-9.75764-21.88531-27.78423-38.08964-44.1503-54.82042-33.26141-31.46425-76.71833-51.87712-122.55319-55.50793-45.51168-4.21666-92.30607 5.8386-131.88541 28.75562Z"
             />
             <path
               transform="translate(301.5 326.8) scale(0.8)" // Recalculated transform for scale 0.8
               fill="#00dffe"
               d="M264.98588 60h29.732c11.55445 1.1407 14.83489 1.77787 23.08145 3.8187 10.04503 2.44093 20.16425 5.48566 29.26531 9.05676 10.25371 4.95037 20.69125 10.17708 30.57592 15.78197C383.817 95.84 391.6062 99.68568 397.9349 106.36625c6.05804 5.23011 11.8767 11.56383 17.18386 18.80455 6.74748 8.13379 13.21044 16.64182 18.3188 25.85812 3.37251 12.68969-16.26802 4.34327-23.56819 6.74105-92.82082.0851-185.64165.15494-278.46249.22003-10.83967-6.316 7.59452-17.8252 9.71957-25.74405 8.12787-9.05289 13.88274-20.6389 23.9685-27.63889 6.80339-6.76464 14.01466-11.91203 22.63621-17.48892 12.09642-8.01756 15.99342-10.5314 28.34624-15.38844 11.73512-4.12446 13.84878-5.16225 26.64402-8.00079 8.04108-2.49042 8.44553-2.28743 16.04136-2.85207z"
             />
             <path
               transform="translate(301.5 326.8) scale(0.8)" // Recalculated transform for scale 0.8
               fill="#00defe"
               d="m61.53248 223.2616 3.6428-2.07167c1.7309-.98437 3.22922-.17011 3.2514 1.82078.0746 6.69461-.38954 16.20311-.21297 21.99331-.12424 11.28706.4704 22.63256-.7576 33.87217-.17728 1.62251-1.67957 3.16587-3.30978 3.12929-3.67405-.0824-7.13453-1.40344-10.81626-3.67189-5.9387-3.77712-8.56799-8.14381-11.07574-12.60786-.65678-1.91728-.61043-4.11997-.91649-6.16987-.66135-8.26776 1.29438-16.58842 5.01272-23.96096 1.50552-2.43564 4.44932-4.51768 6.15828-5.6089 2.85262-2.48303 6.01886-4.38459 9.02364-6.7244z"
             />
             {/* Simple Smile Path Overlay - Fades in */}
             {/* <path
               d="M 442 600 Q 512 630 582 600" // Adjusted smile curve coordinates
               stroke="#00defe" // Match face color or use white
               strokeWidth="8" // Adjusted stroke width
               fill="none"
               strokeLinecap="round"
               style={{ opacity: smileProgress, transition: 'opacity 0.1s linear' }} // Control opacity
             /> */}
           </g>
         </svg>
       </div>
    </div>
  );
};

export default LaughingMan;