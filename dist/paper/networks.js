import { networkMarks } from "./iconData.js";
export const networkNames = Object.keys(networkMarks);
/** The display name of a social network. */
export function networkLabel(network) {
    return networkMarks[network].label;
}
//# sourceMappingURL=networks.js.map