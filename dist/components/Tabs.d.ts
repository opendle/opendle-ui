import { type ReactNode } from "react";
export interface TabItem<Id extends string> {
    readonly id: Id;
    readonly label: ReactNode;
    readonly count?: number;
}
export interface TabsProps<Id extends string> {
    /** The prefix of the tab and panel IDs. Give the same value to `TabPanel`. */
    readonly idBase: string;
    readonly label: string;
    readonly items: readonly TabItem<Id>[];
    readonly value: Id;
    readonly onChange: (id: Id) => void;
    readonly className?: string;
}
/** A tab list with arrow-key movement. The host renders the `TabPanel`. */
export declare function Tabs<Id extends string>({ className, idBase, items, label, onChange, value, }: TabsProps<Id>): import("react").JSX.Element;
export interface TabPanelProps {
    readonly idBase: string;
    readonly id: string;
    readonly children: ReactNode;
    readonly className?: string;
}
/** The content of the selected tab. */
export declare function TabPanel({ children, className, id, idBase }: TabPanelProps): import("react").JSX.Element;
//# sourceMappingURL=Tabs.d.ts.map