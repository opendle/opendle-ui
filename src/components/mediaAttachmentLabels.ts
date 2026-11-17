export interface MediaAttachmentListLabels {
  readonly list: string;
  readonly open: string;
  readonly remove: string;
  readonly moveEarlier: string;
  readonly moveLater: string;
  readonly uploading: string;
}

export const mediaAttachmentListLabels: MediaAttachmentListLabels = {
  list: "Media",
  open: "Open",
  remove: "Remove",
  moveEarlier: "Move earlier",
  moveLater: "Move later",
  uploading: "Uploading",
};
