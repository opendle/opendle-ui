import { type ReactNode } from "react";
export interface AgentSidebarProps {
    readonly isOpen: boolean;
    readonly isCollapsed?: boolean;
    readonly workspaceName: ReactNode;
    readonly agentName?: ReactNode;
    readonly contextLabel: ReactNode;
    readonly children: ReactNode;
    readonly onClose: () => void;
    readonly onSend?: (message: string) => void;
    readonly composerLabel?: string;
    readonly placeholder?: string;
    readonly statusText?: ReactNode;
    readonly runStopped?: boolean;
    readonly onRunStop?: () => void;
    readonly safetyNote?: ReactNode;
    readonly className?: string;
}
export declare function AgentSidebar({ children, className, agentName, composerLabel, contextLabel, isCollapsed, isOpen, onClose, onRunStop, onSend, placeholder, runStopped, safetyNote, statusText, workspaceName, }: AgentSidebarProps): import("react").JSX.Element;
//# sourceMappingURL=AgentSidebar.d.ts.map