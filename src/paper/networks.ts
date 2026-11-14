import { networkMarks } from "./iconData.js";

export type NetworkName = keyof typeof networkMarks;

export const networkNames = Object.keys(networkMarks) as NetworkName[];

/** The display name of a social network. */
export function networkLabel(network: NetworkName): string {
  return networkMarks[network].label;
}
