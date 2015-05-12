/// <reference path="node/node.d.ts" />
/// <reference path="jsdoc/jsdoc.d.ts" />
/// <reference path="../node_modules/typescript/bin/typescript.d.ts" />

declare module JSDoc {
    export interface Doclet {
        isConstructor?: boolean;
        isCallSignature?: boolean;
        isCtorSignature?: boolean;
        generic?: string;
    }
}

declare module "typescript" {
    export var localizedDiagnosticMessages: { [key: string]: string };

    export interface Type {
        checker: TypeChecker;
    }

    export enum ExitStatus {
        Success = 0,
        DiagnosticsPresent_OutputsSkipped = 1,
        DiagnosticsPresent_OutputsGenerated = 0
    }

    export module sys {
        export var args: string[];
        export var newLine: string;
        export var useCaseSensitiveFileNames: boolean;

        export function write(s: string): void;
        export function readFile(fileName: string, encoding?: string): string;
        export function writeFile(fileName: string, data: string|Buffer, writeByteOrderMark?: boolean): void;
        export function watchFile(fileName: string, callback: (fileName: string) => void): { close(): void; };
        export function resolvePath(path: string): string;
        export function fileExists(path: string): boolean;
        export function directoryExists(path: string): boolean;
        export function createDirectory(directoryName: string): void;
        export function getExecutingFilePath(): string;
        export function getCurrentDirectory(): string;
        export function readDirectory(path: string, extension?: string): string[];
        export function getMemoryUsage(): number;
        export function exit(exitCode: number): void;
    }
}
