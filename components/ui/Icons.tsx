
import React from 'react';

const createIconWithPaths = (paths: string[]) => (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
);

const createIcon = (d: string) => createIconWithPaths([d]);

export const DashboardIcon = createIconWithPaths(["M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6"]);
export const UsersIcon = createIconWithPaths(["M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M20 8v6M23 11h-6"]);
export const PackageIcon = createIconWithPaths(["M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.78 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z", "M2.32 6.16l7.89 4.02 7.8-4.03M12 22.76V12"]);
export const ReceiptIcon = createIcon("M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z");
export const XIcon = createIcon("M18 6L6 18M6 6l12 12");
export const BarChartIcon = createIconWithPaths(["M12 20V10", "M18 20V4", "M6 20V16"]);
export const CalendarIcon = createIconWithPaths(["M8 2v4", "M16 2v4", "M3 10h18", "M3 6h18v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"]);
export const SettingsIcon = createIconWithPaths(["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"]);
export const CreditCardIcon = createIconWithPaths(["M22 12v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4", "M2 6h20v4H2z", "M6 16h.01"]);
export const LogOutIcon = createIconWithPaths(["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"]);
export const UserCogIcon = createIconWithPaths(["M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M18 18m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0", "M20.8 15.6l-1.3 1.3", "m-2.8 2.8 1.3-1.3", "M18 21v-1.5", "M18 15v1.5", "M20.1 16.5l1.3-1.3", "m-2.8 2.8-1.3 1.3", "M15.9 16.5l-1.3-1.3", "m2.8-2.8 1.3 1.3"]);
export const HistoryIcon = createIconWithPaths(["M1 4v6h6", "M3.51 15a9 9 0 1 0 2.19-9.51L1 10"]);
export const DumbbellIcon = createIconWithPaths(["M12 2L4 5v6c0 5.55 3.58 10.42 8 11.92C16.42 21.42 20 16.55 20 11V5l-8-3z", "M15 9H9v6h6", "M9 12h4"]);
export const DollarSignIcon = createIconWithPaths(["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]);
export const UsersRoundIcon = createIconWithPaths(["M10 16v-2a3 3 0 0 0-3-3H4a3 3 0 0 0-3 3v2", "M7.5 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z", "M18 16v-2a3 3 0 0 0-3-3h-1", "M14.5 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"]);
export const AlertTriangleIcon = createIconWithPaths(["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]);
export const PlusCircleIcon = createIconWithPaths(["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 8v8", "M8 12h8"]);
export const EditIcon = createIconWithPaths(["M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"]);
export const TrashIcon = createIconWithPaths(["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"]);
export const MailIcon = createIconWithPaths(["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"]);
export const Loader2Icon = createIcon("M21 12a9 9 0 1 1-6.219-8.56");
export const CheckCircleIcon = createIconWithPaths(["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4L12 14.01l-3-3"]);
export const SparklesIcon = createIconWithPaths(["M9.91 4.09l.49 1.94", "M3.49 10.49l1.94.49", "M18.06 19.91l-1.94-.49", "m1.41-1.41-1.94-.49", "M4.09 9.91l1.94-.49", "M19.91 18.06l-.49-1.94", "m-14.14 0 .49-1.94", "M12 2v2", "M12 20v2", "M2 12h2", "M20 12h2", "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"]);
export const SendIcon = createIconWithPaths(["m22 2-7 20-4-9-9-4 20-7z"]);
export const HeartIcon = createIcon("M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z");
export const ExclamationCircleIcon = createIconWithPaths(["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 8v4", "M12 16h.01"]);
export const InfoCircleIcon = createIconWithPaths(["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 8v4", "M12 16h.01"]);
export const MenuIcon = createIconWithPaths(["M3 12h18", "M3 6h18", "M3 18h18"]);
export const SearchIcon = createIconWithPaths(["M21 21l-4.35-4.35", "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"]);
export const ShieldCheckIcon = createIconWithPaths(["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4-4"]);
export const ChevronLeftIcon = createIcon("m15 18-6-6 6-6");
export const ChevronRightIcon = createIcon("m9 18 6-6-6-6");
export const ChevronsLeftIcon = createIcon("m11 17-5-5 5-5m6 10-5-5 5-5");
export const ChevronsRightIcon = createIcon("m13 17 5-5-5-5M6 17l5-5-5-5");
export const UserCircleIcon = createIconWithPaths(["M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3", "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"]);
export const GraduationCapIcon = createIconWithPaths(["M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z", "M22 10v6", "M6 12.07V16a6 6 0 0 0 6 6v-3"]);
export const BellIcon = createIconWithPaths(["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"]);
export const MegaphoneIcon = createIcon("m-3 1-7.89 6.26a1 1 0 0 0 .1 1.63L13 15.29V19a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3.71l7.79-6.4a1 1 0 0 0 .1-1.63L16 1l-3 2-3-2z");
export const TrendingUpIcon = createIcon("M23 6l-9.5 9.5-5-5L1 18");
export const ArrowUp = createIcon("M12 5l-7 7h14z");
export const ArrowDown = createIcon("M12 19l7-7H5z");
export const BarcodeIcon = createIconWithPaths(["M3 6h18v2H3z","M3 10h18v2H3z","M3 14h18v2H3z","M3 18h18v2H3z"]);
export const PixIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M14.6,15.76l-1.12-1.13a1.7,1.7,0,0,0-2.41,0L9.94,15.76a1.71,1.71,0,0,0,0,2.41l1.13,1.13a1.71,1.71,0,0,0,2.41,0l1.12-1.13A1.71,1.71,0,0,0,14.6,15.76ZM5.09,8.24l1.13-1.13a1.71,1.71,0,0,1,2.41,0L9.76,8.24a1.71,1.71,0,0,1,0,2.41L8.63,11.78a1.71,1.71,0,0,1-2.41,0L5.09,10.65A1.71,1.71,0,0,1,5.09,8.24Zm9.51,0L13.47,7.11a1.7,1.7,0,0,0-2.41,0L9.94,8.24a1.71,1.71,0,0,0,0,2.41l1.13,1.13a1.71,1.71,0,0,0,2.41,0l1.12-1.13A1.71,1.71,0,0,0,14.6,8.24ZM9.94,4.67a1.71,1.71,0,0,0,1.2-.5L12.27,3a1.71,1.71,0,0,0,0-2.41,1.71,1.71,0,0,0-2.41,0l-1.12,1.13a1.71,1.71,0,0,0,0,2.41A1.71,1.71,0,0,0,9.94,4.67Z"/>
    </svg>
);