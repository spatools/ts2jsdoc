/* tslint:disable */
import ts = require("typescript");
import ast = require("./ast");
var anyTs = <any>ts;

//#region commandLineParser
export module _ts {
    //#region Custom
    type CommandLineOption = ts.CommandLineOption;
    type ParsedCommandLine = ts.ParsedCommandLine;
    type CompilerOptions = ts.CompilerOptions;
    type Diagnostic = ts.Diagnostic;
    interface Map<T> extends ts.Map<T> { }

    var ModuleKind = anyTs.ModuleKind;
    var ScriptTarget = anyTs.ScriptTarget;
    var CharacterCodes = anyTs.CharacterCodes;
    var sys = ts.sys;

    var Diagnostics = anyTs.Diagnostics;
    var forEach = anyTs.forEach;
    var hasProperty = anyTs.hasProperty;
    var createCompilerDiagnostic = anyTs.createCompilerDiagnostic;
    //#endregion

    export var optionDeclarations: CommandLineOption[] = [
        {
            name: "charset",
            type: "string",
        },
        {
            name: "codepage",
            type: "number",
        },
        {
            name: "declaration",
            shortName: "d",
            type: "boolean",
            description: Diagnostics.Generates_corresponding_d_ts_file,
        },
        {
            name: "diagnostics",
            type: "boolean",
        },
        {
            name: "emitBOM",
            type: "boolean"
        },
        {
            name: "help",
            shortName: "h",
            type: "boolean",
            description: Diagnostics.Print_this_message,
        },
        {
            name: "locale",
            type: "string",
        },
        {
            name: "mapRoot",
            type: "string",
            description: Diagnostics.Specifies_the_location_where_debugger_should_locate_map_files_instead_of_generated_locations,
            paramType: Diagnostics.LOCATION,
        },
        {
            name: "module",
            shortName: "m",
            type: {
                "commonjs": ModuleKind.CommonJS,
                "amd": ModuleKind.AMD
            },
            description: Diagnostics.Specify_module_code_generation_Colon_commonjs_or_amd,
            paramType: Diagnostics.KIND,
            error: Diagnostics.Argument_for_module_option_must_be_commonjs_or_amd
        },
        {
            name: "noEmitOnError",
            type: "boolean",
            description: Diagnostics.Do_not_emit_outputs_if_any_type_checking_errors_were_reported,
        },
        {
            name: "noImplicitAny",
            type: "boolean",
            description: Diagnostics.Warn_on_expressions_and_declarations_with_an_implied_any_type,
        },
        {
            name: "noLib",
            type: "boolean",
        },
        {
            name: "noLibCheck",
            type: "boolean",
        },
        {
            name: "noResolve",
            type: "boolean",
        },
        {
            name: "out",
            type: "string",
            description: Diagnostics.Concatenate_and_emit_output_to_single_file,
            paramType: Diagnostics.FILE,
        },
        {
            name: "outDir",
            type: "string",
            description: Diagnostics.Redirect_output_structure_to_the_directory,
            paramType: Diagnostics.DIRECTORY,
        },
        {
            name: "preserveConstEnums",
            type: "boolean",
            description: Diagnostics.Do_not_erase_const_enum_declarations_in_generated_code
        },
        {
            name: "removeComments",
            type: "boolean",
            description: Diagnostics.Do_not_emit_comments_to_output,
        },
        {
            name: "sourceMap",
            type: "boolean",
            description: Diagnostics.Generates_corresponding_map_file,
        },
        {
            name: "sourceRoot",
            type: "string",
            description: Diagnostics.Specifies_the_location_where_debugger_should_locate_TypeScript_files_instead_of_source_locations,
            paramType: Diagnostics.LOCATION,
        },
        {
            name: "suppressImplicitAnyIndexErrors",
            type: "boolean",
            description: Diagnostics.Suppress_noImplicitAny_errors_for_indexing_objects_lacking_index_signatures,
        },
        {
            name: "target",
            shortName: "t",
            type: { "es3": ScriptTarget.ES3, "es5": ScriptTarget.ES5, "es6": ScriptTarget.ES6 },
            description: Diagnostics.Specify_ECMAScript_target_version_Colon_ES3_default_ES5_or_ES6_experimental,
            paramType: Diagnostics.VERSION,
            error: Diagnostics.Argument_for_target_option_must_be_es3_es5_or_es6
        },
        {
            name: "version",
            shortName: "v",
            type: "boolean",
            description: Diagnostics.Print_the_compiler_s_version,
        },
        {
            name: "watch",
            shortName: "w",
            type: "boolean",
            description: Diagnostics.Watch_input_files,
        }
    ];

    var shortOptionNames: Map<string> = {};
    var optionNameMap: Map<CommandLineOption> = {};

    forEach(optionDeclarations, option => {
        optionNameMap[option.name.toLowerCase()] = option;

        if (option.shortName) {
            shortOptionNames[option.shortName] = option.name;
        }
    });

    export function parseCommandLine(commandLine: string[]): ParsedCommandLine {
        // Set default compiler option values
        var options: CompilerOptions = {
            target: ScriptTarget.ES3,
            module: ModuleKind.None
        };
        var filenames: string[] = [];
        var errors: Diagnostic[] = [];

        parseStrings(commandLine);
        return {
            options,
            filenames,
            errors
        };

        function parseStrings(args: string[]) {
            var i = 0;
            while (i < args.length) {
                var s = args[i++];
                if (s.charCodeAt(0) === CharacterCodes.at) {
                    parseResponseFile(s.slice(1));
                }
                else if (s.charCodeAt(0) === CharacterCodes.minus) {
                    s = s.slice(s.charCodeAt(1) === CharacterCodes.minus ? 2 : 1).toLowerCase();

                    // Try to translate short option names to their full equivalents.
                    if (hasProperty(shortOptionNames, s)) {
                        s = shortOptionNames[s];
                    }

                    if (hasProperty(optionNameMap, s)) {
                        var opt = optionNameMap[s];

                        // Check to see if no argument was provided (e.g. "--locale" is the last command-line argument).
                        if (!args[i] && opt.type !== "boolean") {
                            errors.push(createCompilerDiagnostic(Diagnostics.Compiler_option_0_expects_an_argument, opt.name));
                        }

                        switch (opt.type) {
                            case "number":
                                options[opt.name] = parseInt(args[i++]);
                                break;
                            case "boolean":
                                options[opt.name] = true;
                                break;
                            case "string":
                                options[opt.name] = args[i++] || "";
                                break;
                            // If not a primitive, the possible types are specified in what is effectively a map of options.
                            default:
                                var map = <Map<number>>opt.type;
                                var key = (args[i++] || "").toLowerCase();
                                if (hasProperty(map, key)) {
                                    options[opt.name] = map[key];
                                }
                                else {
                                    errors.push(createCompilerDiagnostic(opt.error));
                                }
                        }
                    }
                    else {
                        errors.push(createCompilerDiagnostic(Diagnostics.Unknown_compiler_option_0, s));
                    }
                }
                else {
                    filenames.push(s);
                }
            }
        }

        function parseResponseFile(filename: string) {
            var text = sys.readFile(filename);

            if (!text) {
                errors.push(createCompilerDiagnostic(Diagnostics.File_0_not_found, filename));
                return;
            }

            var args: string[] = [];
            var pos = 0;
            while (true) {
                while (pos < text.length && text.charCodeAt(pos) <= CharacterCodes.space) pos++;
                if (pos >= text.length) break;
                var start = pos;
                if (text.charCodeAt(start) === CharacterCodes.doubleQuote) {
                    pos++;
                    while (pos < text.length && text.charCodeAt(pos) !== CharacterCodes.doubleQuote) pos++;
                    if (pos < text.length) {
                        args.push(text.substring(start + 1, pos));
                        pos++;
                    }
                    else {
                        errors.push(createCompilerDiagnostic(Diagnostics.Unterminated_quoted_string_in_response_file_0, filename));
                    }
                }
                else {
                    while (text.charCodeAt(pos) > CharacterCodes.space) pos++;
                    args.push(text.substring(start, pos));
                }
            }
            parseStrings(args);
        }
    }
}
//#endregion

//#region tsc

export module _ts {
    //#region Custom
    type EmitReturnStatus = ts.EmitReturnStatus;
    type Program = ts.Program;
    type ParsedCommandLine = ts.ParsedCommandLine;
    type CommandLineOption = ts.CommandLineOption;
    type CompilerHost = ts.CompilerHost;
    type CompilerOptions = ts.CompilerOptions;
    type Diagnostic = ts.Diagnostic;
    type DiagnosticMessage = ts.DiagnosticMessage;
    type FileWatcher = any;
    interface Map<T> extends ts.Map<T> { }

    var ExitStatus = anyTs.ExitStatus;
    var EmitReturnStatus = anyTs.EmitReturnStatus;
    var createProgram = anyTs.createProgram;
    var createCompilerHost = anyTs.createCompilerHost;
    var getLineAndCharacterOfPosition = anyTs.getLineAndCharacterOfPosition;
    var sys = ts.sys;

    var Diagnostics = anyTs.Diagnostics;
    var forEach = anyTs.forEach;
    var hasProperty = anyTs.hasProperty;
    var arrayToMap = anyTs.arrayToMap;
    var filter = anyTs.filter;
    var isEmpty = anyTs.isEmpty;
    var clone = anyTs.clone;
    var concatenate = anyTs.concatenate;
    var lookUp = anyTs.lookUp;
    var normalizePath = anyTs.normalizePath;
    var getDirectoryPath = anyTs.getDirectoryPath;
    var combinePaths = anyTs.combinePaths;
    var getLineStarts = anyTs.getLineStarts;
    var DiagnosticCategory = anyTs.DiagnosticCategory;
    var flattenDiagnosticMessageText = anyTs.flattenDiagnosticMessageText;
    var createCompilerDiagnostic = anyTs.createCompilerDiagnostic;

    var compareValues = <T>(a: T, b: T) => anyTs.compareValues(a, b);
    //#endregion

    var version = "1.4.0.0";

    /**
     * Checks to see if the locale is in the appropriate format,
     * and if it is, attempts to set the appropriate language.
     */
    function validateLocaleAndSetLanguage(locale: string, errors: Diagnostic[]): boolean {
        var matchResult = /^([a-z]+)([_\-]([a-z]+))?$/.exec(locale.toLowerCase());

        if (!matchResult) {
            errors.push(createCompilerDiagnostic(Diagnostics.Locale_must_be_of_the_form_language_or_language_territory_For_example_0_or_1, 'en', 'ja-jp'));
            return false;
        }

        var language = matchResult[1];
        var territory = matchResult[3];

        // First try the entire locale, then fall back to just language if that's all we have.
        if (!trySetLanguageAndTerritory(language, territory, errors) &&
            !trySetLanguageAndTerritory(language, undefined, errors)) {

            errors.push(createCompilerDiagnostic(Diagnostics.Unsupported_locale_0, locale));
            return false;
        }

        return true;
    }

    function trySetLanguageAndTerritory(language: string, territory: string, errors: Diagnostic[]): boolean {
        var compilerFilePath = normalizePath(sys.getExecutingFilePath());
        var containingDirectoryPath = getDirectoryPath(compilerFilePath);

        var filePath = combinePaths(containingDirectoryPath, language);

        if (territory) {
            filePath = filePath + "-" + territory;
        }

        filePath = sys.resolvePath(combinePaths(filePath, "diagnosticMessages.generated.json"));

        if (!sys.fileExists(filePath)) {
            return false;
        }

        // TODO: Add codePage support for readFile?
        try {
            var fileContents = sys.readFile(filePath);
        }
        catch (e) {
            errors.push(createCompilerDiagnostic(Diagnostics.Unable_to_open_file_0, filePath));
            return false;
        }
        try {
            ts.localizedDiagnosticMessages = JSON.parse(fileContents);
        }
        catch (e) {
            errors.push(createCompilerDiagnostic(Diagnostics.Corrupted_locale_file_0, filePath));
            return false;
        }

        return true;
    }

    function countLines(program: Program): number {
        var count = 0;
        forEach(program.getSourceFiles(), file => {
            count += file.getLineAndCharacterFromPosition(file.end).line;
        });
        return count;
    }

    function getDiagnosticText(message: DiagnosticMessage, ...args: any[]): string {
        var diagnostic: Diagnostic = createCompilerDiagnostic.apply(undefined, arguments);
        return diagnostic.messageText;
    }

    function reportDiagnostic(diagnostic: Diagnostic) {
        var output = "";

        if (diagnostic.file) {
            var loc = diagnostic.file.getLineAndCharacterFromPosition(diagnostic.start);

            output += diagnostic.file.filename + "(" + loc.line + "," + loc.character + "): ";
        }

        var category = DiagnosticCategory[diagnostic.category].toLowerCase();
        output += category + " TS" + diagnostic.code + ": " + diagnostic.messageText + sys.newLine;

        sys.write(output);
    }

    function reportDiagnostics(diagnostics: Diagnostic[]) {
        for (var i = 0; i < diagnostics.length; i++) {
            reportDiagnostic(diagnostics[i]);
        }
    }

    function padLeft(s: string, length: number) {
        while (s.length < length) {
            s = " " + s;
        }
        return s;
    }

    function padRight(s: string, length: number) {
        while (s.length < length) {
            s = s + " ";
        }

        return s;
    }

    function reportStatisticalValue(name: string, value: string) {
        sys.write(padRight(name + ":", 12) + padLeft(value.toString(), 10) + sys.newLine);
    }

    function reportCountStatistic(name: string, count: number) {
        reportStatisticalValue(name, "" + count);
    }

    function reportTimeStatistic(name: string, time: number) {
        reportStatisticalValue(name,(time / 1000).toFixed(2) + "s");
    }

    export function executeCommandLine(args: string[]): void {
        var commandLine = parseCommandLine(args);
        var compilerOptions = commandLine.options;

        if (compilerOptions.locale) {
            if (typeof JSON === "undefined") {
                reportDiagnostic(createCompilerDiagnostic(Diagnostics.The_current_host_does_not_support_the_0_option, "--locale"));
                return sys.exit(1);
            }

            validateLocaleAndSetLanguage(commandLine.options.locale, commandLine.errors);
        }

        // If there are any errors due to command line parsing and/or
        // setting up localization, report them and quit.
        if (commandLine.errors.length > 0) {
            reportDiagnostics(commandLine.errors);
            return sys.exit(EmitReturnStatus.CompilerOptionsErrors);
        }

        if (compilerOptions.version) {
            reportDiagnostic(createCompilerDiagnostic(Diagnostics.Version_0, version));
            return sys.exit(EmitReturnStatus.Succeeded);
        }

        if (compilerOptions.help) {
            printVersion();
            printHelp();
            return sys.exit(EmitReturnStatus.Succeeded);
        }

        if (commandLine.filenames.length === 0) {
            printVersion();
            printHelp();
            return sys.exit(EmitReturnStatus.CompilerOptionsErrors);
        }

        var defaultCompilerHost = createCompilerHost(compilerOptions);

        if (compilerOptions.watch) {
            if (!sys.watchFile) {
                reportDiagnostic(createCompilerDiagnostic(Diagnostics.The_current_host_does_not_support_the_0_option, "--watch"));
                return sys.exit(EmitReturnStatus.CompilerOptionsErrors);
            }

            watchProgram(commandLine, defaultCompilerHost);
        }
        else {
            var result = compile(commandLine, defaultCompilerHost).exitStatus
            return sys.exit(result);
        }
    }

    /**
     * Compiles the program once, and then watches all given and referenced files for changes.
     * Upon detecting a file change, watchProgram will queue up file modification events for the next
     * 250ms and then perform a recompilation. The reasoning is that in some cases, an editor can
     * save all files at once, and we'd like to just perform a single recompilation.
     */
    function watchProgram(commandLine: ParsedCommandLine, compilerHost: CompilerHost): void {
        var watchers: Map<FileWatcher> = {};
        var updatedFiles: Map<boolean> = {};

        // Compile the program the first time and watch all given/referenced files.
        var program = compile(commandLine, compilerHost).program;
        reportDiagnostic(createCompilerDiagnostic(Diagnostics.Compilation_complete_Watching_for_file_changes));
        addWatchers(program);
        return;

        function addWatchers(program: Program) {
            forEach(program.getSourceFiles(), f => {
                var filename = getCanonicalName(f.filename);
                watchers[filename] = sys.watchFile(filename, fileUpdated);
            });
        }

        function removeWatchers(program: Program) {
            forEach(program.getSourceFiles(), f => {
                var filename = getCanonicalName(f.filename);
                if (hasProperty(watchers, filename)) {
                    watchers[filename].close();
                }
            });

            watchers = {};
        }

        // Fired off whenever a file is changed.
        function fileUpdated(filename: string) {
            var firstNotification = isEmpty(updatedFiles);
            updatedFiles[getCanonicalName(filename)] = true;

            // Only start this off when the first file change comes in,
            // so that we can batch up all further changes.
            if (firstNotification) {
                setTimeout(() => {
                    var changedFiles = updatedFiles;
                    updatedFiles = {};

                    recompile(changedFiles);
                }, 250);
            }
        }

        function recompile(changedFiles: Map<boolean>) {
            reportDiagnostic(createCompilerDiagnostic(Diagnostics.File_change_detected_Compiling));
            // Remove all the watchers, as we may not be watching every file
            // specified since the last compilation cycle.
            removeWatchers(program);

            // Reuse source files from the last compilation so long as they weren't changed.
            var oldSourceFiles = arrayToMap(
                filter(program.getSourceFiles(), file => !hasProperty(changedFiles, getCanonicalName(file.filename))),
                file => getCanonicalName(file.filename));

            // We create a new compiler host for this compilation cycle.
            // This new host is effectively the same except that 'getSourceFile'
            // will try to reuse the SourceFiles from the last compilation cycle
            // so long as they were not modified.
            var newCompilerHost = clone(compilerHost);
            newCompilerHost.getSourceFile = (fileName, languageVersion, onError) => {
                fileName = getCanonicalName(fileName);

                var sourceFile = lookUp(oldSourceFiles, fileName);
                if (sourceFile) {
                    return sourceFile;
                }

                return compilerHost.getSourceFile(fileName, languageVersion, onError);
            };

            program = compile(commandLine, newCompilerHost).program;
            reportDiagnostic(createCompilerDiagnostic(Diagnostics.Compilation_complete_Watching_for_file_changes));
            addWatchers(program);
        }

        function getCanonicalName(fileName: string) {
            return compilerHost.getCanonicalFileName(fileName);
        }
    }

    function compile(commandLine: ParsedCommandLine, compilerHost: CompilerHost) {
        var parseStart = new Date().getTime();
        var compilerOptions = commandLine.options;
        var program = createProgram(commandLine.filenames, compilerOptions, compilerHost);

        var bindStart = new Date().getTime();
        var errors: Diagnostic[] = program.getDiagnostics();
        var exitStatus: EmitReturnStatus;

        if (errors.length) {
            var checkStart = bindStart;
            var emitStart = bindStart;
            var reportStart = bindStart;
            exitStatus = EmitReturnStatus.AllOutputGenerationSkipped;
        }
        else {
            var checker = program.getTypeChecker(/*fullTypeCheckMode*/ true);
            var checkStart = new Date().getTime();
            errors = checker.getDiagnostics();
            if (checker.isEmitBlocked()) {
                exitStatus = EmitReturnStatus.AllOutputGenerationSkipped;
            }
            else {
                var emitStart = new Date().getTime();
                ast.compile(program, commandLine, checker);
                //var emitOutput = checker.emitFiles();
                //var emitErrors = emitOutput.diagnostics;
                //exitStatus = emitOutput.emitResultStatus;
                var reportStart = new Date().getTime();
                //errors = concatenate(errors, emitErrors);
            }
        }

        reportDiagnostics(errors);
        if (commandLine.options.diagnostics) {
            var memoryUsed = sys.getMemoryUsage ? sys.getMemoryUsage() : -1;
            reportCountStatistic("Files", program.getSourceFiles().length);
            reportCountStatistic("Lines", countLines(program));
            reportCountStatistic("Nodes", checker ? checker.getNodeCount() : 0);
            reportCountStatistic("Identifiers", checker ? checker.getIdentifierCount() : 0);
            reportCountStatistic("Symbols", checker ? checker.getSymbolCount() : 0);
            reportCountStatistic("Types", checker ? checker.getTypeCount() : 0);
            if (memoryUsed >= 0) {
                reportStatisticalValue("Memory used", Math.round(memoryUsed / 1000) + "K");
            }
            reportTimeStatistic("Parse time", bindStart - parseStart);
            reportTimeStatistic("Bind time", checkStart - bindStart);
            reportTimeStatistic("Check time", emitStart - checkStart);
            reportTimeStatistic("Emit time", reportStart - emitStart);
            reportTimeStatistic("Total time", reportStart - parseStart);
        }

        return { program, exitStatus };
    }

    function printVersion() {
        sys.write(getDiagnosticText(Diagnostics.Version_0, version) + sys.newLine);
    }

    function printHelp() {
        var output = "";

        // We want to align our "syntax" and "examples" commands to a certain margin.
        var syntaxLength = getDiagnosticText(Diagnostics.Syntax_Colon_0, "").length;
        var examplesLength = getDiagnosticText(Diagnostics.Examples_Colon_0, "").length;
        var marginLength = Math.max(syntaxLength, examplesLength);

        // Build up the syntactic skeleton.
        var syntax = makePadding(marginLength - syntaxLength);
        syntax += "tsc [" + getDiagnosticText(Diagnostics.options) + "] [" + getDiagnosticText(Diagnostics.file) + " ...]";

        output += getDiagnosticText(Diagnostics.Syntax_Colon_0, syntax);
        output += sys.newLine + sys.newLine;

        // Build up the list of examples.
        var padding = makePadding(marginLength);
        output += getDiagnosticText(Diagnostics.Examples_Colon_0, makePadding(marginLength - examplesLength) + "tsc hello.ts") + sys.newLine;
        output += padding + "tsc --out file.js file.ts" + sys.newLine;
        output += padding + "tsc @args.txt" + sys.newLine;
        output += sys.newLine;

        output += getDiagnosticText(Diagnostics.Options_Colon) + sys.newLine;

        // Sort our options by their names, (e.g. "--noImplicitAny" comes before "--watch")
        var optsList = optionDeclarations.slice();
        optsList.sort((a, b) => compareValues<string>(a.name.toLowerCase(), b.name.toLowerCase()));

        // We want our descriptions to align at the same column in our output,
        // so we keep track of the longest option usage string.
        var marginLength = 0;
        var usageColumn: string[] = []; // Things like "-d, --declaration" go in here.
        var descriptionColumn: string[] = [];

        for (var i = 0; i < optsList.length; i++) {
            var option = optsList[i];

            // If an option lacks a description,
            // it is not officially supported.
            if (!option.description) {
                continue;
            }

            var usageText = " ";
            if (option.shortName) {
                usageText += "-" + option.shortName;
                usageText += getParamType(option);
                usageText += ", ";
            }

            usageText += "--" + option.name;
            usageText += getParamType(option);

            usageColumn.push(usageText);
            descriptionColumn.push(getDiagnosticText(option.description));

            // Set the new margin for the description column if necessary.
            marginLength = Math.max(usageText.length, marginLength);
        }

        // Special case that can't fit in the loop.
        var usageText = " @<" + getDiagnosticText(Diagnostics.file) + ">";
        usageColumn.push(usageText);
        descriptionColumn.push(getDiagnosticText(Diagnostics.Insert_command_line_options_and_files_from_a_file));
        marginLength = Math.max(usageText.length, marginLength);

        // Print out each row, aligning all the descriptions on the same column.
        for (var i = 0; i < usageColumn.length; i++) {
            var usage = usageColumn[i];
            var description = descriptionColumn[i];
            output += usage + makePadding(marginLength - usage.length + 2) + description + sys.newLine;
        }

        sys.write(output);
        return;

        function getParamType(option: CommandLineOption) {
            if (option.paramType !== undefined) {
                return " " + getDiagnosticText(option.paramType);
            }
            return "";
        }

        function makePadding(paddingLength: number): string {
            return Array(paddingLength + 1).join(" ");
        }
    }
}

//#endregion
