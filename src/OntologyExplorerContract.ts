/** Public read limits from the Ontology HTTP contract. */
export const ONTOLOGY_PAGE_LIMIT = 200;
export const ONTOLOGY_GRAPH_LIMIT = 5_000;
export const ONTOLOGY_LABEL_LIMIT = 1_000;
export const ONTOLOGY_TYPE_LIMIT = 1_000;
export const ONTOLOGY_PROPERTY_LIMIT = 2_000;
export const ONTOLOGY_OCCURRENCE_LIMIT = 10_000;

interface OntologyPropertyOccurrenceBase {
  readonly value: unknown;
  readonly bagId?: string;
}

export type OntologyPropertyOccurrence = OntologyPropertyOccurrenceBase &
  (
    | { readonly createdAt: string; readonly updatedAt: string }
    | { readonly createdAt?: never; readonly updatedAt?: never }
  );

export type OntologyPropertyMap = Readonly<
  Record<string, readonly OntologyPropertyOccurrence[]>
>;

export interface OntologyRecordSummary {
  readonly kind: "object" | "link";
  readonly key: string;
  readonly type: string;
  readonly displayTitle: string;
  readonly labels: readonly string[];
  readonly properties?: OntologyPropertyMap;
  readonly timestamps?: {
    readonly createdAt: string;
    readonly updatedAt: string;
  };
}

export interface OntologyCanvasPosition {
  readonly objectKey: string;
  readonly x: number;
  readonly y: number;
}

export interface OntologyGraphObject extends OntologyRecordSummary {
  readonly kind: "object";
}

export interface OntologyGraphLink extends OntologyRecordSummary {
  readonly kind: "link";
  readonly endpointA: string;
  readonly endpointB: string;
  readonly direction: "a_to_b" | "b_to_a" | "bidirectional";
}

export interface OntologyMetadataBag {
  readonly id: string;
  readonly source?: string;
  readonly location?: {
    readonly latitude: number;
    readonly longitude: number;
  };
  readonly at?: string;
  readonly from?: string;
  readonly to?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OntologyFileMetadata {
  readonly fileId: string;
  readonly name: string;
  readonly mediaType: string;
  readonly size: number;
  readonly sha256: string;
  readonly createdAt: string;
}

export interface OntologyTypeDefinition {
  readonly apiName: string;
  readonly title: string;
  readonly parentTypes: readonly string[];
  readonly deprecated?: boolean;
  readonly inherited?: boolean;
}

export function assertBoundedItems(
  name: string,
  values: readonly unknown[],
  maximum = ONTOLOGY_PAGE_LIMIT,
): void {
  if (!Array.isArray(values)) {
    throw new TypeError(`${name} must be an array.`);
  }
  if (values.length > maximum) {
    throw new RangeError(
      `${name} must contain at most ${String(maximum)} items.`,
    );
  }
}

function assertUnicodeScalarText(name: string, value: string): void {
  if (typeof value !== "string") {
    throw new TypeError(`${name} must be text.`);
  }
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (
      codePoint === undefined ||
      (codePoint >= 0xd800 && codePoint <= 0xdfff)
    ) {
      throw new TypeError(`${name} must contain only Unicode scalar values.`);
    }
  }
}

export function assertIdentifier(name: string, value: string): void {
  assertUnicodeScalarText(name, value);
  if (value.length === 0 || value.includes("\0")) {
    throw new TypeError(`${name} must be non-empty text without NUL.`);
  }
}

export function assertTextMaximum(
  name: string,
  value: string,
  maximum: number,
): void {
  assertUnicodeScalarText(name, value);
  const scalarLength = Array.from(value).length;
  if (scalarLength > maximum) {
    throw new RangeError(
      `${name} must contain at most ${String(maximum)} characters.`,
    );
  }
}

export function assertApiName(name: string, value: string): void {
  assertIdentifier(name, value);
  assertTextMaximum(name, value, 100);
  if (!/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(value)) {
    throw new TypeError(`${name} must be a valid API name.`);
  }
}

export function assertUniqueIdentifiers(
  name: string,
  values: readonly string[],
): void {
  const unique = new Set<string>();
  for (const value of values) {
    assertIdentifier(name, value);
    if (unique.has(value)) {
      throw new TypeError(`${name} must not contain duplicate identifiers.`);
    }
    unique.add(value);
  }
}

export function assertFiniteNumber(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

const RFC3339_DATE_TIME =
  /^(\d{4})-(\d{2})-(\d{2})[Tt]((?:[01]\d|2[0-3])):([0-5]\d):([0-5]\d)(?:\.\d+)?(?:[Zz]|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

export function assertRfc3339DateTime(name: string, value: string): void {
  assertTextMaximum(name, value, 100);
  const match = RFC3339_DATE_TIME.exec(value);
  if (!match) {
    throw new TypeError(`${name} must be one valid RFC 3339 date-time.`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (
    year === 0 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > (daysInMonth[month - 1] ?? 0)
  ) {
    throw new TypeError(`${name} must be one valid RFC 3339 date-time.`);
  }
}

export function countOccurrences(properties?: OntologyPropertyMap): number {
  if (!properties) return 0;
  return Object.values(properties).reduce(
    (total, occurrences) => total + occurrences.length,
    0,
  );
}

export function validateOntologyRecordSummary(
  record: OntologyRecordSummary,
  expectedKind?: OntologyRecordSummary["kind"],
): void {
  const kind: unknown = record.kind;
  if (
    (kind !== "object" && kind !== "link") ||
    (expectedKind !== undefined && kind !== expectedKind)
  ) {
    throw new TypeError("Ontology record kind is invalid.");
  }
  assertIdentifier("Ontology record key", record.key);
  assertTextMaximum("Ontology record key", record.key, 200);
  assertApiName("Ontology record type", record.type);
  assertIdentifier("Ontology display title", record.displayTitle);
  assertTextMaximum("Ontology display title", record.displayTitle, 500);
  assertBoundedItems(
    "Ontology record labels",
    record.labels,
    ONTOLOGY_LABEL_LIMIT,
  );
  assertUniqueIdentifiers("Ontology record label", record.labels);
  for (const label of record.labels) {
    assertTextMaximum("Ontology record label", label, 200);
  }
  if (record.properties !== undefined) {
    const properties = Object.entries(record.properties);
    assertBoundedItems(
      "Ontology record properties",
      properties,
      ONTOLOGY_PROPERTY_LIMIT,
    );
    for (const [apiName, occurrences] of properties) {
      assertApiName("Ontology property API name", apiName);
      assertBoundedItems(
        "Ontology property occurrences",
        occurrences,
        ONTOLOGY_OCCURRENCE_LIMIT,
      );
      for (const occurrence of occurrences) {
        const candidate: unknown = occurrence;
        if (typeof candidate !== "object" || candidate === null) {
          throw new TypeError("Ontology property occurrence is invalid.");
        }
        const runtimeOccurrence = candidate as {
          readonly bagId?: unknown;
          readonly createdAt?: unknown;
          readonly updatedAt?: unknown;
        };
        const { bagId, createdAt, updatedAt } = runtimeOccurrence;
        if (bagId !== undefined) {
          if (typeof bagId !== "string") {
            throw new TypeError(
              "Ontology occurrence bag identifier is invalid.",
            );
          }
          assertIdentifier("Ontology occurrence bag identifier", bagId);
          assertTextMaximum("Ontology occurrence bag identifier", bagId, 200);
        }
        const hasCreatedAt = createdAt !== undefined;
        const hasUpdatedAt = updatedAt !== undefined;
        if (hasCreatedAt !== hasUpdatedAt) {
          throw new TypeError(
            "Ontology occurrence timestamps must be both present or both absent.",
          );
        }
        if (createdAt !== undefined && updatedAt !== undefined) {
          if (typeof createdAt !== "string" || typeof updatedAt !== "string") {
            throw new TypeError("Ontology occurrence timestamps are invalid.");
          }
          assertRfc3339DateTime("Ontology occurrence creation time", createdAt);
          assertRfc3339DateTime("Ontology occurrence update time", updatedAt);
        }
      }
    }
  }
  if (record.timestamps !== undefined) {
    assertRfc3339DateTime(
      "Ontology record creation time",
      record.timestamps.createdAt,
    );
    assertRfc3339DateTime(
      "Ontology record update time",
      record.timestamps.updatedAt,
    );
  }
}

export function validateOntologyMetadataBag(bag: OntologyMetadataBag): void {
  assertIdentifier("Metadata bag identifier", bag.id);
  assertTextMaximum("Metadata bag identifier", bag.id, 200);
  if (bag.source !== undefined) {
    assertUnicodeScalarText("Metadata bag source", bag.source);
    if (bag.source.includes("\0")) {
      throw new TypeError("Metadata bag source must not contain NUL.");
    }
    assertTextMaximum("Metadata bag source", bag.source, 1_000);
  }
  if (bag.location) {
    const { latitude, longitude } = bag.location;
    assertFiniteNumber("Metadata bag latitude", latitude);
    assertFiniteNumber("Metadata bag longitude", longitude);
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new RangeError(
        "Metadata bag coordinates are outside their public ranges.",
      );
    }
  }
  assertRfc3339DateTime("Metadata bag creation time", bag.createdAt);
  assertRfc3339DateTime("Metadata bag update time", bag.updatedAt);
  for (const [name, value] of [
    ["Metadata bag at time", bag.at],
    ["Metadata bag from time", bag.from],
    ["Metadata bag to time", bag.to],
  ] as const) {
    if (value !== undefined) {
      assertRfc3339DateTime(name, value);
    }
  }
}

export function formatOntologyFileSize(size: number): string {
  assertFiniteNumber("File size", size);
  if (!Number.isInteger(size) || size < 0) {
    throw new RangeError("File size must be a non-negative integer.");
  }
  if (size < 1_000) return `${String(size)} B`;
  if (size < 1_000_000) return `${(size / 1_000).toFixed(1)} kB`;
  return `${(size / 1_000_000).toFixed(1)} MB`;
}

export function moveCanvasPosition(
  position: OntologyCanvasPosition,
  key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
  options: {
    readonly maximumX: number;
    readonly maximumY: number;
    readonly step?: number;
  },
): OntologyCanvasPosition {
  const step = options.step ?? 12;
  assertFiniteNumber("Canvas step", step);
  assertFiniteNumber("Canvas maximum x", options.maximumX);
  assertFiniteNumber("Canvas maximum y", options.maximumY);
  assertIdentifier("Canvas object key", position.objectKey);
  assertTextMaximum("Canvas object key", position.objectKey, 200);
  assertFiniteNumber("Canvas x", position.x);
  assertFiniteNumber("Canvas y", position.y);
  if (step <= 0 || options.maximumX < 0 || options.maximumY < 0) {
    throw new RangeError("Canvas movement bounds must be non-negative.");
  }
  const movement = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  } as const;
  const [deltaX, deltaY] = movement[key];
  return {
    objectKey: position.objectKey,
    x: Math.min(options.maximumX, Math.max(0, position.x + deltaX)),
    y: Math.min(options.maximumY, Math.max(0, position.y + deltaY)),
  };
}
