/** Public read limits from the Ontology HTTP contract. */
export declare const ONTOLOGY_PAGE_LIMIT = 200;
export declare const ONTOLOGY_GRAPH_LIMIT = 5000;
export declare const ONTOLOGY_LABEL_LIMIT = 1000;
export declare const ONTOLOGY_TYPE_LIMIT = 1000;
export declare const ONTOLOGY_PROPERTY_LIMIT = 2000;
export declare const ONTOLOGY_OCCURRENCE_LIMIT = 10000;
interface OntologyPropertyOccurrenceBase {
    readonly value: unknown;
    readonly bagId?: string;
}
export type OntologyPropertyOccurrence = OntologyPropertyOccurrenceBase & ({
    readonly createdAt: string;
    readonly updatedAt: string;
} | {
    readonly createdAt?: never;
    readonly updatedAt?: never;
});
export type OntologyPropertyMap = Readonly<Record<string, readonly OntologyPropertyOccurrence[]>>;
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
export declare function assertBoundedItems(name: string, values: readonly unknown[], maximum?: number): void;
export declare function assertIdentifier(name: string, value: string): void;
export declare function assertTextMaximum(name: string, value: string, maximum: number): void;
export declare function assertApiName(name: string, value: string): void;
export declare function assertUniqueIdentifiers(name: string, values: readonly string[]): void;
export declare function assertFiniteNumber(name: string, value: number): void;
export declare function assertRfc3339DateTime(name: string, value: string): void;
export declare function countOccurrences(properties?: OntologyPropertyMap): number;
export declare function validateOntologyRecordSummary(record: OntologyRecordSummary, expectedKind?: OntologyRecordSummary["kind"]): void;
export declare function validateOntologyMetadataBag(bag: OntologyMetadataBag): void;
export declare function formatOntologyFileSize(size: number): string;
export declare function moveCanvasPosition(position: OntologyCanvasPosition, key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown", options: {
    readonly maximumX: number;
    readonly maximumY: number;
    readonly step?: number;
}): OntologyCanvasPosition;
export {};
//# sourceMappingURL=OntologyExplorerContract.d.ts.map