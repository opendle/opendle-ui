export type IconShape = readonly [
    tag: "path" | "circle" | "rect" | "line" | "polyline" | "ellipse",
    attributes: Readonly<Record<string, string>>
];
export declare const iconShapes: {
    readonly calendar: readonly [readonly ["path", {
        readonly d: "M8 2v4";
    }], readonly ["path", {
        readonly d: "M16 2v4";
    }], readonly ["rect", {
        readonly width: "18";
        readonly height: "18";
        readonly x: "3";
        readonly y: "4";
        readonly rx: "2";
    }], readonly ["path", {
        readonly d: "M3 10h18";
    }], readonly ["path", {
        readonly d: "M8 14h.01";
    }], readonly ["path", {
        readonly d: "M12 14h.01";
    }], readonly ["path", {
        readonly d: "M16 14h.01";
    }], readonly ["path", {
        readonly d: "M8 18h.01";
    }], readonly ["path", {
        readonly d: "M12 18h.01";
    }], readonly ["path", {
        readonly d: "M16 18h.01";
    }]];
    readonly message: readonly [readonly ["path", {
        readonly d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719";
    }]];
    readonly chart: readonly [readonly ["path", {
        readonly d: "M3 3v16a2 2 0 0 0 2 2h16";
    }], readonly ["path", {
        readonly d: "M18 17V9";
    }], readonly ["path", {
        readonly d: "M13 17V5";
    }], readonly ["path", {
        readonly d: "M8 17v-3";
    }]];
    readonly settings: readonly [readonly ["path", {
        readonly d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915";
    }], readonly ["circle", {
        readonly cx: "12";
        readonly cy: "12";
        readonly r: "3";
    }]];
    readonly heart: readonly [readonly ["path", {
        readonly d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5";
    }]];
    readonly "eye-off": readonly [readonly ["path", {
        readonly d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49";
    }], readonly ["path", {
        readonly d: "M14.084 14.158a3 3 0 0 1-4.242-4.242";
    }], readonly ["path", {
        readonly d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143";
    }], readonly ["path", {
        readonly d: "m2 2 20 20";
    }]];
    readonly smile: readonly [readonly ["circle", {
        readonly cx: "12";
        readonly cy: "12";
        readonly r: "10";
    }], readonly ["path", {
        readonly d: "M8 14s1.5 2 4 2 4-2 4-2";
    }], readonly ["line", {
        readonly x1: "9";
        readonly x2: "9.01";
        readonly y1: "9";
        readonly y2: "9";
    }], readonly ["line", {
        readonly x1: "15";
        readonly x2: "15.01";
        readonly y1: "9";
        readonly y2: "9";
    }]];
    readonly "chevron-left": readonly [readonly ["path", {
        readonly d: "m15 18-6-6 6-6";
    }]];
    readonly "chevron-right": readonly [readonly ["path", {
        readonly d: "m9 18 6-6-6-6";
    }]];
    readonly "chevron-down": readonly [readonly ["path", {
        readonly d: "m6 9 6 6 6-6";
    }]];
    readonly check: readonly [readonly ["path", {
        readonly d: "M20 6 9 17l-5-5";
    }]];
    readonly clock: readonly [readonly ["circle", {
        readonly cx: "12";
        readonly cy: "12";
        readonly r: "10";
    }], readonly ["path", {
        readonly d: "M12 6v6l4 2";
    }]];
    readonly alert: readonly [readonly ["path", {
        readonly d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3";
    }], readonly ["path", {
        readonly d: "M12 9v4";
    }], readonly ["path", {
        readonly d: "M12 17h.01";
    }]];
    readonly "external-link": readonly [readonly ["path", {
        readonly d: "M15 3h6v6";
    }], readonly ["path", {
        readonly d: "M10 14 21 3";
    }], readonly ["path", {
        readonly d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6";
    }]];
    readonly play: readonly [readonly ["path", {
        readonly d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z";
    }]];
    readonly reply: readonly [readonly ["path", {
        readonly d: "M20 18v-2a4 4 0 0 0-4-4H4";
    }], readonly ["path", {
        readonly d: "m9 17-5-5 5-5";
    }]];
    readonly retry: readonly [readonly ["path", {
        readonly d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8";
    }], readonly ["path", {
        readonly d: "M21 3v5h-5";
    }]];
    readonly close: readonly [readonly ["path", {
        readonly d: "M18 6 6 18";
    }], readonly ["path", {
        readonly d: "m6 6 12 12";
    }]];
    readonly send: readonly [readonly ["path", {
        readonly d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z";
    }], readonly ["path", {
        readonly d: "m21.854 2.147-10.94 10.939";
    }]];
    readonly plus: readonly [readonly ["path", {
        readonly d: "M5 12h14";
    }], readonly ["path", {
        readonly d: "M12 5v14";
    }]];
    readonly trash: readonly [readonly ["path", {
        readonly d: "M10 11v6";
    }], readonly ["path", {
        readonly d: "M14 11v6";
    }], readonly ["path", {
        readonly d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6";
    }], readonly ["path", {
        readonly d: "M3 6h18";
    }], readonly ["path", {
        readonly d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2";
    }]];
    readonly copy: readonly [readonly ["rect", {
        readonly width: "14";
        readonly height: "14";
        readonly x: "8";
        readonly y: "8";
        readonly rx: "2";
        readonly ry: "2";
    }], readonly ["path", {
        readonly d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2";
    }]];
    readonly upload: readonly [readonly ["path", {
        readonly d: "M12 3v12";
    }], readonly ["path", {
        readonly d: "m17 8-5-5-5 5";
    }], readonly ["path", {
        readonly d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4";
    }]];
    readonly key: readonly [readonly ["path", {
        readonly d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z";
    }], readonly ["circle", {
        readonly cx: "16.5";
        readonly cy: "7.5";
        readonly r: ".5";
        readonly fill: "currentColor";
    }]];
    readonly passkey: readonly [readonly ["path", {
        readonly d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4";
    }], readonly ["path", {
        readonly d: "M14 13.12c0 2.38 0 6.38-1 8.88";
    }], readonly ["path", {
        readonly d: "M17.29 21.02c.12-.6.43-2.3.5-3.02";
    }], readonly ["path", {
        readonly d: "M2 12a10 10 0 0 1 18-6";
    }], readonly ["path", {
        readonly d: "M2 16h.01";
    }], readonly ["path", {
        readonly d: "M21.8 16c.2-2 .131-5.354 0-6";
    }], readonly ["path", {
        readonly d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2";
    }], readonly ["path", {
        readonly d: "M8.65 22c.21-.66.45-1.32.57-2";
    }], readonly ["path", {
        readonly d: "M9 6.8a6 6 0 0 1 9 5.2v2";
    }]];
    readonly "sign-out": readonly [readonly ["path", {
        readonly d: "m16 17 5-5-5-5";
    }], readonly ["path", {
        readonly d: "M21 12H9";
    }], readonly ["path", {
        readonly d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4";
    }]];
    readonly user: readonly [readonly ["path", {
        readonly d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2";
    }], readonly ["circle", {
        readonly cx: "12";
        readonly cy: "7";
        readonly r: "4";
    }]];
    readonly info: readonly [readonly ["circle", {
        readonly cx: "12";
        readonly cy: "12";
        readonly r: "10";
    }], readonly ["path", {
        readonly d: "M12 16v-4";
    }], readonly ["path", {
        readonly d: "M12 8h.01";
    }]];
    readonly success: readonly [readonly ["circle", {
        readonly cx: "12";
        readonly cy: "12";
        readonly r: "10";
    }], readonly ["path", {
        readonly d: "m9 12 2 2 4-4";
    }]];
    readonly image: readonly [readonly ["rect", {
        readonly width: "18";
        readonly height: "18";
        readonly x: "3";
        readonly y: "3";
        readonly rx: "2";
        readonly ry: "2";
    }], readonly ["circle", {
        readonly cx: "9";
        readonly cy: "9";
        readonly r: "2";
    }], readonly ["path", {
        readonly d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21";
    }]];
    readonly more: readonly [readonly ["circle", {
        readonly cx: "12";
        readonly cy: "12";
        readonly r: "1";
    }], readonly ["circle", {
        readonly cx: "19";
        readonly cy: "12";
        readonly r: "1";
    }], readonly ["circle", {
        readonly cx: "5";
        readonly cy: "12";
        readonly r: "1";
    }]];
    readonly search: readonly [readonly ["path", {
        readonly d: "m21 21-4.34-4.34";
    }], readonly ["circle", {
        readonly cx: "11";
        readonly cy: "11";
        readonly r: "8";
    }]];
    readonly tag: readonly [readonly ["path", {
        readonly d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z";
    }], readonly ["circle", {
        readonly cx: "7.5";
        readonly cy: "7.5";
        readonly r: ".5";
        readonly fill: "currentColor";
    }]];
    readonly edit: readonly [readonly ["path", {
        readonly d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z";
    }], readonly ["path", {
        readonly d: "m15 5 4 4";
    }]];
};
export declare const networkMarks: {
    readonly x: {
        readonly label: "X";
        readonly color: "#000000";
        readonly path: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z";
    };
    readonly facebook: {
        readonly label: "Facebook";
        readonly color: "#0866FF";
        readonly path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z";
    };
    readonly instagram: {
        readonly label: "Instagram";
        readonly color: "#E4405F";
        readonly path: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077";
    };
    readonly threads: {
        readonly label: "Threads";
        readonly color: "#000000";
        readonly path: "M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z";
    };
    readonly bluesky: {
        readonly label: "Bluesky";
        readonly color: "#0285FF";
        readonly path: "M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026";
    };
    readonly youtube: {
        readonly label: "YouTube";
        readonly color: "#FF0000";
        readonly path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";
    };
    readonly pinterest: {
        readonly label: "Pinterest";
        readonly color: "#BD081C";
        readonly path: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z";
    };
    readonly tumblr: {
        readonly label: "Tumblr";
        readonly color: "#36465D";
        readonly path: "M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.178l.011.002z";
    };
    readonly tiktok: {
        readonly label: "TikTok";
        readonly color: "#000000";
        readonly path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";
    };
};
//# sourceMappingURL=iconData.d.ts.map