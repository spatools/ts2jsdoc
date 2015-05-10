import ts = require("typescript");

var getCommentsRegexp = /\/\*\*\s*((?!\s*\*\/)[\s\S]+?)\s*\*\//m,
    getCommentsDescRegexp = /\s*\*?\s*((?:(?!\s*\*\s*@\w+)[\s\S])+)/m,
    getCommentsTagRegexp = /[^\{]@([^\s]+)\s*(?:\{(.+?)\})?\s*([^\s]+)?((?:(?!\s*\*\s*@\w+)[\s\S])+)?/gm;

export class Tag {
    constructor(
        public tag: string,
        public name?: string,
        public type?: string,
        public desc?: string) { }

    static fromText(text: string): Tag[] {
        var tags: Tag[] = [],
            tagMatch: RegExpExecArray;

        while (tagMatch = getCommentsTagRegexp.exec(text)) {
            tags.push(new Tag(tagMatch[1], tagMatch[3], tagMatch[2], tagMatch[4]));
        }

        return tags;
    }

    public toString(): string {
        var result = " * @" + this.tag;

        if (this.type) {
            result += " {" + this.type + "}";
        }

        if (this.name) {
            result += " " + this.name;
        }

        if (this.desc) {
            result += " " + this.desc;
        }

        return result;
    }
}

export class Comments {
    public raw: string = null;
    public content: string = null;
    public desc: string = null;

    public tags: Tag[] = [];
    public list: CommentsList;

    static fromNode(node: ts.Node): Comments {
        var text = node.getFullText();
        return Comments.fromText(text);
    }
    static fromText(text: string): Comments {
        var match = text.match(getCommentsRegexp),
            result = new Comments(),
            descMatch, tagsMatch;

        if (!match) {
            return result;
        }

        result.raw = match[0];
        result.content = match[1];
        result.tags = [];

        if (descMatch = result.content.match(getCommentsDescRegexp)) {
            result.desc = descMatch[1];
        }

        result.tags = Tag.fromText(result.content);

        return result;
    }

    public isEmpty(): boolean {
        return (!this.desc && this.tags.length === 0);
    }
    public toString(): string {
        if (this.isEmpty()) {
            return "";
        }

        var result = "\n/**";
        if (this.desc) {
            result += "\n * " + this.desc;
        }

        result += "\n" + this.tags.map(t => t.toString()).join("\n");

        return result + "\n */";
    }

    public hasTag(tag: string, name?: string): boolean {
        return !!this.getTag(tag, name);
    }
    public getTag(tag: string, name?: string): Tag {
        if (this.tags.length === 0) {
            return null;
        }

        var i = 0,
            len = this.tags.length,
            current: Tag;

        for (; i < len; i++) {
            current = this.tags[i];

            if (current.tag === tag &&
                (!name || current.name === name)) {
                return current;
            }
        }

        return null;
    }
    public addTag(tag: string, name?: string, type?: string, desc?: string): Tag {
        var tmpTag = new Tag(tag, name, type, desc);

        this.tags.push(tmpTag);

        return tmpTag;
    }

    public getOrAddTag(tag: string, name?: string): Tag {
        var tmp = this.getTag(tag, name);
        if (!tmp) {
            tmp = this.addTag(tag, name);
        }

        return tmp;
    }
    public getParamTag(name: string, node?: ts.ParameterDeclaration) {
        if (this.tags.length === 0) {
            return this.addTag("param", name);
        }

        var tag = this.getTag("param", name),
            repeat = !!node && !!node.dotDotDotToken,
            optional = !!node && (!!node.questionToken || !!node.initializer);

        if (!tag && repeat && optional) {
            tag = this.getTag("param", "[..." + name + "]");
        }

        if (!tag && repeat) {
            tag = this.getTag("param", "..." + name);
        }

        if (!tag && optional) {
            tag = this.getTag("param", "[" + name + "]");
        }

        if (!tag) {
            tag = this.addTag("param", name);
        }

        return tag;
    }

    public clone(): Comments {
        var comment = new Comments();
        comment.desc = this.desc;
        comment.tags = this.tags.slice(0);

        if (this.list) {
            this.list.add(comment);
        }

        return comment;
    }
    public mergeTo(other: Comments): void {
        if (this.desc) {
            other.desc = other.desc ? other.desc + "\n *\n * " : "";
            other.desc += this.desc;
        }

        this.tags.forEach(tag => {
            var otherTag = other.getOrAddTag(tag.tag, tag.name);
            if (tag.desc && tag.desc !== otherTag.desc) {
                otherTag.desc = tag.desc;
            }

            if (tag.type && tag.desc !== otherTag.type) {
                otherTag.type = tag.type;
            }
        });
    }

    public clean() {
        this.desc = null;
        this.tags = [];
    }

    public addLinked(): Comments {
        if (!this.list) {
            throw new Error("This comment is not linked to any list");
        }

        return this.list.add();
    }
}

export class CommentsList {
    public cache: any = {};
    private list: Comments[] = [];

    public add(): Comments;
    public add(comment: Comments): Comments;
    public add(comment?: Comments): Comments {
        if (this.list.indexOf(comment) !== -1) {
            return;
        }

        if (!comment) {
            comment = new Comments();
        }

        comment.list = this;
        this.list.push(comment);

        return comment;
    }
    public addFromNode(node: ts.Node): Comments {
        var comment = Comments.fromNode(node);
        return this.add(comment);
    }

    public get(kind: string, name: string, parentName?: string): Comments {
        var result: Comments;

        this.list.some(comment => {
            if (comment.hasTag(kind, name) && (!parentName || comment.hasTag("memberof", parentName))) {
                result = comment;
                return true;
            }
        });

        return result;
    }

    public clear(): void {
        this.list = [];
    }
    public toString() {
        return this.list.filter(item => !item.isEmpty()).join("\n\n").replace(/\n{2,}/g, "\n\n");
    }
}
