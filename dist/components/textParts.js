const addressPattern = /\b(?:https?:\/\/|www\.)[^\s<>"]+/giu;
const trailingPunctuation = /[.,;:!?'"’”*_\]}>)]+$/u;
/** Remove the punctuation after an address, but keep a closing bracket of it. */
function trimAddress(address) {
    let text = address.replace(trailingPunctuation, "");
    let rest = address.slice(text.length);
    while (rest.startsWith(")")) {
        const open = text.split("(").length - 1;
        const close = text.split(")").length - 1;
        if (open <= close)
            break;
        text += ")";
        rest = rest.slice(1);
    }
    return text;
}
/**
 * Cut a text into plain parts and web addresses. Only `http`, `https` and
 * `www.` addresses become links.
 */
export function textParts(text) {
    const parts = [];
    let index = 0;
    for (const match of text.matchAll(addressPattern)) {
        const address = trimAddress(match[0]);
        if (address === "" || /^www\.$/iu.test(address))
            continue;
        if (match.index > index)
            parts.push({ text: text.slice(index, match.index) });
        parts.push({
            text: address,
            href: /^www\./iu.test(address) ? `https://${address}` : address,
        });
        index = match.index + address.length;
    }
    if (index < text.length)
        parts.push({ text: text.slice(index) });
    return parts;
}
//# sourceMappingURL=textParts.js.map