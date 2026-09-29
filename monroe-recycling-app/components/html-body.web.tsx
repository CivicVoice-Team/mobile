import type { CSSProperties } from "react";
import type { StyleProp, TextStyle } from "react-native";

import { Fonts } from "@/constants/theme";

function looksLikeHtml(value: string) {
    return /<[a-z][\s\S]*>/i.test(value);
}

function escapePlainText(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function linkifyPlainText(value: string) {
    const escaped = escapePlainText(value);
    const withLinks = escaped.replace(
        /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/gi,
        (match) => {
            const href = /^https?:\/\//i.test(match) ? match : `https://${match}`;
            return `<a href="${href}">${match}</a>`;
        }
    );
    return withLinks.replace(/\n/g, "<br>");
}

function px(value: unknown) {
    if (typeof value === "number") return `${value}px`;
    if (typeof value === "string") return value;
    return undefined;
}

function toWebTextStyle(style?: StyleProp<TextStyle>): CSSProperties {
    if (!style || typeof style !== "object" || Array.isArray(style)) {
        return {};
    }

    const src = style as TextStyle;
    const out: CSSProperties = {};

    const fontSize = px(src.fontSize);
    if (fontSize) out.fontSize = fontSize;

    const lineHeight = px(src.lineHeight);
    if (lineHeight) out.lineHeight = lineHeight;

    if (src.color) out.color = src.color;
    if (src.fontWeight) out.fontWeight = String(src.fontWeight);
    if (src.fontFamily) out.fontFamily = src.fontFamily;
    if (src.fontStyle) out.fontStyle = src.fontStyle;
    if (src.textAlign) out.textAlign = src.textAlign as CSSProperties["textAlign"];

    const marginTop = px(src.marginTop);
    if (marginTop) out.marginTop = marginTop;
    const marginBottom = px(src.marginBottom);
    if (marginBottom) out.marginBottom = marginBottom;

    return out;
}

type HtmlBodyProps = {
    html: string;
    style?: StyleProp<TextStyle>;
};

export function HtmlBody({ html, style }: HtmlBodyProps) {
    const source = html?.trim() ?? "";
    const markup = looksLikeHtml(source) ? source : linkifyPlainText(source);

    return (
        <>
            <style>{`
                .html-body ul,
                .html-body ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                .html-body p,
                .html-body div {
                    margin: 0 0 6px;
                }
                .html-body p:empty,
                .html-body div:empty {
                    margin: 0 0 8px;
                    min-height: 0;
                    height: 8px;
                }
                .html-body a {
                    color: #0a7ea4;
                    text-decoration: underline;
                }
            `}</style>
            <div
                className="html-body"
                style={{
                    fontFamily: Fonts.sans,
                    fontSize: 16,
                    lineHeight: 1.5,
                    ...toWebTextStyle(style),
                }}
                dangerouslySetInnerHTML={{ __html: markup }}
            />
        </>
    );
}
