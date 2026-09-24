import { StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";

import { Fonts } from "@/constants/theme";

type AstNode = {
    type: "text" | "element";
    tag?: string;
    attrs?: Record<string, string>;
    text?: string;
    children: AstNode[];
};

const BLOCK_TAGS = new Set([
    "div",
    "p",
    "ul",
    "ol",
    "li",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
]);

const FONT_SIZE_MAP: Record<string, number> = {
    "1": 10,
    "2": 13,
    "3": 16,
    "4": 18,
    "5": 24,
    "6": 32,
    "7": 48,
};

function looksLikeHtml(value: string) {
    return /<[a-z][\s\S]*>/i.test(value);
}

function decodeEntities(value: string) {
    return value
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function parseAttrs(raw: string) {
    const attrs: Record<string, string> = {};
    const re = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(raw))) {
        attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
    }
    return attrs;
}

function parseCss(style: string | undefined): TextStyle {
    if (!style) return {};
    const out: TextStyle = {};
    for (const part of style.split(";")) {
        const colon = part.indexOf(":");
        if (colon === -1) continue;
        const key = part.slice(0, colon).trim().toLowerCase();
        const val = part.slice(colon + 1).trim();
        if (!key || !val) continue;
        if (key === "color") out.color = val;
        if (key === "font-size") {
            const size = parseFloat(val);
            if (!Number.isNaN(size)) out.fontSize = size;
        }
        if (key === "font-family") {
            out.fontFamily = val.split(",")[0].replace(/['"]/g, "").trim();
        }
        if (key === "font-weight") {
            const numeric = parseInt(val, 10);
            if (val === "bold" || numeric >= 600) out.fontWeight = "700";
        }
        if (key === "font-style" && val.includes("italic")) {
            out.fontStyle = "italic";
        }
        if (key === "text-decoration" && val.includes("underline")) {
            out.textDecorationLine = "underline";
        }
    }
    return out;
}

function parseHtml(html: string): AstNode[] {
    const root: AstNode = { type: "element", tag: "root", attrs: {}, children: [] };
    const stack = [root];
    let index = 0;

    while (index < html.length) {
        if (html[index] !== "<") {
            const next = html.indexOf("<", index);
            const text = html.slice(index, next === -1 ? html.length : next);
            index = next === -1 ? html.length : next;
            if (text) {
                stack[stack.length - 1].children.push({
                    type: "text",
                    text: decodeEntities(text),
                    children: [],
                });
            }
            continue;
        }

        const close = html.indexOf(">", index);
        if (close === -1) break;
        const raw = html.slice(index + 1, close).trim();
        index = close + 1;

        if (!raw || raw.startsWith("!")) continue;

        if (raw.startsWith("/")) {
            const tag = raw.slice(1).trim().toLowerCase().split(/\s+/)[0];
            for (let depth = stack.length - 1; depth > 0; depth -= 1) {
                if (stack[depth].tag === tag) {
                    stack.length = depth;
                    break;
                }
            }
            continue;
        }

        const selfClosing = raw.endsWith("/") || /^br\b/i.test(raw) || /^hr\b/i.test(raw);
        const tagMatch = raw.match(/^([a-z0-9]+)/i);
        const tag = (tagMatch?.[1] ?? "span").toLowerCase();
        const attrs = parseAttrs(raw.slice(tag.length));
        const node: AstNode = { type: "element", tag, attrs, children: [] };
        stack[stack.length - 1].children.push(node);
        if (!selfClosing) stack.push(node);
    }

    return root.children;
}

function isBlock(tag?: string) {
    return Boolean(tag && BLOCK_TAGS.has(tag));
}

function hasBlockChild(nodes: AstNode[]) {
    return nodes.some((node) => node.type === "element" && isBlock(node.tag));
}

function styleFromNode(node: AstNode, inherited: TextStyle): TextStyle {
    const next: TextStyle = { ...inherited };
    const tag = node.tag;
    const attrs = node.attrs ?? {};

    if (tag === "b" || tag === "strong") next.fontWeight = "700";
    if (tag === "i" || tag === "em") next.fontStyle = "italic";
    if (tag === "u") next.textDecorationLine = "underline";
    if (tag === "h1") next.fontSize = 28;
    if (tag === "h2") next.fontSize = 24;
    if (tag === "h3") next.fontSize = 20;

    if (tag === "font") {
        if (attrs.color) next.color = attrs.color;
        if (attrs.face) {
            next.fontFamily = attrs.face.split(",")[0].replace(/['"]/g, "").trim();
        }
        if (attrs.size && FONT_SIZE_MAP[attrs.size]) {
            next.fontSize = FONT_SIZE_MAP[attrs.size];
        }
    }

    Object.assign(next, parseCss(attrs.style));
    return next;
}

function marginFromStyle(style?: string) {
    if (!style) return 0;
    const match = style.match(/margin(?:-left)?:\s*([\d.]+)px/i);
    return match ? parseFloat(match[1]) : 0;
}

function Inline({
    nodes,
    style,
}: {
    nodes: AstNode[];
    style: TextStyle;
}) {
    return (
        <Text style={style}>
            {nodes.map((node, index) => (
                <InlineNode key={index} node={node} style={style} />
            ))}
        </Text>
    );
}

function InlineNode({ node, style }: { node: AstNode; style: TextStyle }) {
    if (node.type === "text") {
        return <Text style={style}>{node.text}</Text>;
    }
    if (node.tag === "br") {
        return <Text>{"\n"}</Text>;
    }
    const nextStyle = styleFromNode(node, style);
    return (
        <Text style={nextStyle}>
            {node.children.map((child, index) => (
                <InlineNode key={index} node={child} style={nextStyle} />
            ))}
        </Text>
    );
}

function Block({
    nodes,
    style,
    listType,
    listIndex = 1,
}: {
    nodes: AstNode[];
    style: TextStyle;
    listType?: "ul" | "ol";
    listIndex?: number;
}) {
    const groups: { kind: "inline" | "block"; nodes: AstNode[] }[] = [];
    for (const node of nodes) {
        const block = node.type === "element" && isBlock(node.tag);
        const last = groups[groups.length - 1];
        if (!block && last?.kind === "inline") {
            last.nodes.push(node);
        } else {
            groups.push({ kind: block ? "block" : "inline", nodes: [node] });
        }
    }

    return (
        <View>
            {groups.map((group, index) => {
                if (group.kind === "inline") {
                    const onlyBreaks = group.nodes.every(
                        (node) =>
                            (node.type === "text" && !node.text?.trim()) ||
                            node.tag === "br"
                    );
                    if (onlyBreaks) return null;
                    return <Inline key={index} nodes={group.nodes} style={style} />;
                }
                return (
                    <BlockNode
                        key={index}
                        node={group.nodes[0]}
                        style={style}
                        listType={listType}
                        listIndex={listIndex + index}
                    />
                );
            })}
        </View>
    );
}

function BlockNode({
    node,
    style,
    listType,
    listIndex = 1,
}: {
    node: AstNode;
    style: TextStyle;
    listType?: "ul" | "ol";
    listIndex?: number;
}) {
    const nextStyle = styleFromNode(node, style);
    const tag = node.tag;

    if (tag === "ul" || tag === "ol") {
        const items = node.children.filter(
            (child) => child.type === "element" && child.tag === "li"
        );
        return (
            <View style={{ marginVertical: 8, paddingLeft: 4 }}>
                {items.map((item, index) => (
                    <BlockNode
                        key={index}
                        node={item}
                        style={nextStyle}
                        listType={tag}
                        listIndex={index + 1}
                    />
                ))}
            </View>
        );
    }

    if (tag === "li") {
        const marker = listType === "ol" ? `${listIndex}.` : "•";
        return (
            <View style={{ flexDirection: "row", marginBottom: 4, paddingLeft: 8 }}>
                <Text style={[nextStyle, { minWidth: 22, marginRight: 6 }]}>{marker}</Text>
                <View style={{ flex: 1 }}>
                    {hasBlockChild(node.children) ? (
                        <Block nodes={node.children} style={nextStyle} />
                    ) : (
                        <Inline nodes={node.children} style={nextStyle} />
                    )}
                </View>
            </View>
        );
    }

    const indent =
        tag === "blockquote"
            ? marginFromStyle(node.attrs?.style) || 40
            : marginFromStyle(node.attrs?.style);

    return (
        <View style={{ marginBottom: tag === "p" ? 8 : 0, marginLeft: indent }}>
            {hasBlockChild(node.children) ? (
                <Block nodes={node.children} style={nextStyle} />
            ) : (
                <Inline nodes={node.children} style={nextStyle} />
            )}
        </View>
    );
}

type HtmlBodyProps = {
    html: string;
    style?: StyleProp<TextStyle>;
};

export function HtmlBody({ html, style }: HtmlBodyProps) {
    const source = html?.trim() ?? "";
    const flattened = StyleSheet.flatten(style) ?? {};
    const baseStyle: TextStyle = {
        fontFamily: Fonts.sans,
        fontSize: 16,
        lineHeight: 24,
        ...flattened,
    };

    if (!source) return null;

    const nodes = looksLikeHtml(source)
        ? parseHtml(source)
        : [{ type: "text" as const, text: source, children: [] }];

    return (
        <View style={{ marginTop: baseStyle.marginTop ?? 0 }}>
            <Block nodes={nodes} style={{ ...baseStyle, marginTop: 0 }} />
        </View>
    );
}
