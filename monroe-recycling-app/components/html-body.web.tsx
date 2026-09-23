import type { StyleProp, TextStyle } from "react-native";

function looksLikeHtml(value: string) {
    return /<[a-z][\s\S]*>/i.test(value);
}

function escapePlainText(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
}

type HtmlBodyProps = {
    html: string;
    style?: StyleProp<TextStyle>;
};

export function HtmlBody({ html, style }: HtmlBodyProps) {
    const source = html?.trim() ?? "";
    const markup = looksLikeHtml(source) ? source : escapePlainText(source);

    return (
        <>
            <style>{`
                .faq-html-body ul,
                .faq-html-body ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                .faq-html-body p,
                .faq-html-body div {
                    margin: 0 0 8px;
                }
            `}</style>
            <div
                className="faq-html-body"
                style={{
                    fontSize: 16,
                    lineHeight: 1.5,
                    ...(typeof style === "object" && style && !Array.isArray(style)
                        ? (style as object)
                        : {}),
                }}
                dangerouslySetInnerHTML={{ __html: markup }}
            />
        </>
    );
}
