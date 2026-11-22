/** Default English text of the identity components. */

export interface PasskeyListLabels {
  readonly title: string;
  readonly empty: string;
  readonly add: string;
  readonly adding: string;
  readonly unnamed: string;
  readonly added: string;
  readonly lastUsed: string;
  readonly rename: string;
  readonly remove: string;
  readonly removeTitle: string;
  readonly cancel: string;
}

export const passkeyListLabels: PasskeyListLabels = {
  title: "Passkeys",
  empty: "No passkeys",
  add: "Add passkey",
  adding: "Waiting for passkey…",
  unnamed: "Passkey",
  added: "Added",
  lastUsed: "Last used",
  rename: "Rename",
  remove: "Remove",
  removeTitle: "Remove this passkey?",
  cancel: "Cancel",
};

export interface ApiTokenListLabels {
  readonly title: string;
  readonly create: string;
  readonly createTitle: string;
  readonly name: string;
  readonly submit: string;
  readonly createdTitle: string;
  readonly secret: string;
  readonly copy: string;
  readonly copied: string;
  readonly done: string;
  readonly empty: string;
  readonly created: string;
  readonly expires: string;
  readonly revoke: string;
  readonly revokeTitle: string;
  readonly cancel: string;
  readonly close: string;
}

export const apiTokenListLabels: ApiTokenListLabels = {
  title: "API tokens",
  create: "New token",
  createTitle: "New API token",
  name: "Name",
  submit: "Create token",
  createdTitle: "Copy this token now",
  secret: "API token",
  copy: "Copy",
  copied: "Copied",
  done: "Done",
  empty: "No tokens",
  created: "Created",
  expires: "Expires",
  revoke: "Revoke",
  revokeTitle: "Revoke this token?",
  cancel: "Cancel",
  close: "Close",
};

export interface AvatarUploadLabels {
  readonly title: string;
  readonly upload: string;
  readonly replace: string;
  readonly remove: string;
  /** The title of the crop dialog. */
  readonly cropTitle: string;
  /** The accessible name of the frame that moves the picture. */
  readonly position: string;
  readonly zoom: string;
  readonly save: string;
  readonly cancel: string;
  readonly close: string;
}

export const avatarUploadLabels: AvatarUploadLabels = {
  title: "Profile picture",
  upload: "Upload picture",
  replace: "Replace",
  remove: "Remove",
  cropTitle: "Adjust picture",
  position: "Picture position",
  zoom: "Zoom",
  save: "Save",
  cancel: "Cancel",
  close: "Close",
};
