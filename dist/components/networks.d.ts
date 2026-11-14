import { networkMarks } from "./iconData.js";
export type NetworkName = keyof typeof networkMarks;
export declare const networkNames: NetworkName[];
/** The display name of a social network. */
export declare function networkLabel(network: NetworkName): string;
//# sourceMappingURL=networks.d.ts.map