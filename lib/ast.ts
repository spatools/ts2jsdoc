import ts = require("typescript");
import fs = require("fs");
import path = require("path");
import jsdoc = require("./jsdoc");
import processor = require("./processor");

function isDeclarationNode(node: ts.Node): boolean {
    var blocksKind = [
        //ts.SyntaxKind.PropertyDeclaration,
        ts.SyntaxKind.VariableDeclaration,
        ts.SyntaxKind.FunctionDeclaration,
        ts.SyntaxKind.ClassDeclaration,
        ts.SyntaxKind.InterfaceDeclaration,
        ts.SyntaxKind.TypeAliasDeclaration,
        ts.SyntaxKind.EnumDeclaration,
        ts.SyntaxKind.ModuleDeclaration,
        ts.SyntaxKind.ImportDeclaration
    ];

    return blocksKind.indexOf(node.kind) !== -1;
}

function createComments(node: ts.Node, checker: ts.TypeChecker, result: jsdoc.CommentsList = new jsdoc.CommentsList()): jsdoc.CommentsList {
    processor.process(result, node, checker);

    ts.forEachChild(node, child => {
        createComments(child, checker, result);
    });

    return result;
}

export function getOptionsFromConfig(opts: any): ts.CompilerOptions {
    if (!opts) { return; }

    var target: string = opts.target;
    if (target) {
        if (target === "latest") {
            target = "Latest";
        }
        else if (target !== "Latest") {
            target = target.toUpperCase();
        }

        opts.target = (<any>ts).ScriptTarget[target];
    }

    var mod: string = opts.module;
    switch (mod) {
        case "commonjs":
        case "CommonJS":
        case "Commonjs":
        case "CommonJs":
            opts.module = ts.ModuleKind.CommonJS;
            break;

        case "amd":
        case "AMD":
        case "Amd":
            opts.module = ts.ModuleKind.AMD;
            break;

        default:
            opts.module = ts.ModuleKind.None;
            break;
    }

    return opts;
}

export function getFileComments(filename: string, options?: ts.CompilerOptions): jsdoc.CommentsList {
    filename = filename.replace(/\\/g, "/");

    options = options || {
        target: ts.ScriptTarget.ES6,
        module: ts.ModuleKind.CommonJS
    };

    var host = ts.createCompilerHost(options),
        program = ts.createProgram([filename], options, host),
        checker = program.getTypeChecker(true),

        file = program.getSourceFile(filename);

    return createComments(file, checker);
}

export function compile(program: ts.Program, commandLine: ts.ParsedCommandLine, checker: ts.TypeChecker): void {
    commandLine.filenames.forEach(filename => {
        var options = commandLine.options,
            sourceFile = program.getSourceFile(filename),
            comments = createComments(sourceFile, checker),
            newFileName = sourceFile.filename.replace(/(\.d)?\.ts$/, ".jsdoc");

        if (options.outDir) {
            newFileName = newFileName.replace(path.dirname(sourceFile.filename), options.outDir);
        }
        else if (options.out) {
            newFileName = options.out;
        }

        ts.sys.writeFile(newFileName, comments.toString());
    });
}
