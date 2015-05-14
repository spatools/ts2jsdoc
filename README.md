# ts2jsdoc

A JSDoc plugin with an optional template which automatically adds JSDoc comments based on Typescript definitions.

## Overview

### Features

 * Automatically adds JSDoc comments based on Typescript's types:
    * Adds variables and properties types, modifiers, and default values.
    * Adds functions and methods return types, modifiers, generic and variations.
    * Adds parameters types, attributes and default value.
    * Adds interfaces generic, implementations, call signatures, construct signatures and variations.
    * Adds classes generic, implementations and variations.
    * Adds type definitions as typedef.
    * Adds enums supports as typedef.
    * Adds modules as namespaces or external.


 * Adds __@ctor__, __@callsignature__, __@ctorsignature__, __@generic__ tags.
 * Override __@enum__ tag to change its kind as __typedef__.
 * Supports classes with multiple constructors using __@ctor__ tag.
 * Supports interfaces call signatures and constructs signature __@callsignature__ and __@ctorsignature__.
 * Automatically adds comments for anonymous types using __@callback__ or __@typedef__ tags.
 * Transforms interfaces with only call signatures in callbacks.

### Demos

You can see some demos here:

* __typescript.d.ts__: [https://spatools.github.io/ts2jsdoc/typescript/](https://spatools.github.io/ts2jsdoc/typescript/)
* __node.d.ts__: [https://spatools.github.io/ts2jsdoc/node/](https://spatools.github.io/ts2jsdoc/node/)

## Plugin

### Usage

First install the plugin as a dependency.

````console
$ npm install ts2jsdoc
````

Then configure the plugin and the template using JSDoc's `conf.json`:

````json
{
    "source": {
        "includePattern": "(\\.d)?\\.ts$"
    },
    "plugins": [
        "node_modules/ts2jsdoc/plugin.js"
    ],
    "opts": {
        "template": "node_modules/ts2jsdoc/template"
    }
}
````

### Options

All Typescript's compiler options are available.
Plugin options are provided using JSDoc's `config.json`:

````json
"typescript": {
    "target":                           "{es3|es5|es6|latest}",
    "module":                           "{commonjs|amd|none}",
    "codepage":                         "{number}",
    "charset":                          "{string}",
    "mapRoot":                          "{string}",
    "sourceRoot":                       "{string}",
    "allowNonTsExtensions":             "{boolean}",
    "declaration":                      "{boolean}",
    "diagnostics":                      "{boolean}",
    "emitBOM":                          "{boolean}",
    "noEmitOnError":                    "{boolean}",
    "noErrorTruncation":                "{boolean}",
    "noImplicitAny":                    "{boolean}",
    "noLib":                            "{boolean}",
    "noLibCheck":                       "{boolean}",
    "noResolve":                        "{boolean}",
    "preserveConstEnums":               "{boolean}",
    "removeComments":                   "{boolean}",
    "suppressImplicitAnyIndexErrors":   "{boolean}"
}
````

## Template

The template allows you to easily take advantage of the full plugin features. 
It supports generic annotations, call signatures, construct singatures and anonymous types and callbacks.

It's entirely based on [Bootstrap](http://getbootstrap.com) so it's easily customizable using a simple [Bootstrap theme](http://getbootstrap.com/customize/).

### Configuration
 
Template options are provided using JSDoc's `config.json`:

````json
"templates": {
    "systemName":           "{string}",
    "theme":                "{path | default}",
    "navType":              "{vertical | inline}",
    "inverseNav":           "{boolean}", 
    "tableOfContents":      "{boolean}",
    "linenums":             "{boolean}",
    "collapseSymbols":      "{boolean}",
    "footer":               "{string}",
    "copyright":            "{string}",
    "analytics":            "{string}",
    "outputSourceFiles":    "{boolean}",
    "outputSourcePath":     "{boolean}"
}
````

### Options

* __systemName__: The name of the system being documented. This will appear in the page title for each page.
* __theme__: _(Optional)_ A path or an url to a directory containing Bootstrap theme CSS files. You can use `staticFiles` JSDoc option to add the theme in the template.
* __navType__: _(Optional, Default: vertical)_ The template uses top level navigation with dropdowns for the contents of each category. On large systems these dropdowns can get large enough to be difficult to read beyond the page. To make the dropdowns render wide, set this option to `"inline"`. Otherwise set it to `"vertical"` to make them regular stacked dropdowns.
* __inverseNav__: _(Optional, Default: false)_ Bootstrap navbars come in two flavors, regular and inverse where inverse is generally higher contrast. Set this to `true` to use the inverse header.
* __tableOfContents__: _(Optional, Default: true)_ If true, displays a table of contents as side of your page and the top navbar contains main navigation. Otherwise, the side menu will contains main navigation and top menu will contains only links to top level categories (Classes, Interfaces, Namespaces, ...).
* __linenums__: _(Optional, Default: false)_ If true, linenums will be displayed as side of highlighted code.
* __collapseSymbols__: _(Optional, Default: true)_ If your pages have a large number of symbols, it can be easy to get lost in all the text. If `true` all of the symbols in the page will roll their contents up so that you just get a list of symbols that can be expanded and collapsed.
* __footer__: _(Optional)_ Any markup want to appear in the footer of each page. This is not processed at all, just printed exactly as you enter it.
* __copyright__: _(Optional)_ You can add a copyright message below the footer and above the JSDoc timestamp at the bottom of the page.
* __analytics__: _(Optional)_ Add a [Google Analytics](http://www.google.com/analytics) code to the template output. Use your Site ID. e.g. `"analytics": "UA-XXXXX-XXX"`.

## CLI

ts2jsdoc can also be used as a standalone CLI tool to generate .js.doc files from Typescript files.

### Usage

First install ts2jsdoc as a global pacakge.

```console
$ npm install -g ts2jsdoc
```

Then you can use the plugin with the same options as `tsc`.

```console
$ ts2jsdoc --module commonjs --target es5 lib.d.ts
```

## Contribute

Any contribution is welcome !

### Get started

First, clone the repository:

```console
$ git clone https://gitub.com/spatools/ts2jsdoc.git
```

Then install dev dependencies:

```console
$ npm install
```

### Build targets

Then project is using Grunt.js for test and build. To start a task type:

```console
$ grunt <task>
```

* __dev__: Tests and builds Typescript files for development (sourceMaps included).
* __build__: Tests and builds Typescript files for distribution.
* __doc__: Creates jsdoc for typescript.d.ts and node.d.ts
* __serve__: Creates a HTTP server to test created jsdoc sites on http://localhost:8080/.

