import { Text, type StyleProp, type TextStyle } from "react-native";

function looksLikeHtml(value: string) {
    return /<[a-z][\s\S]*>/i.test(value);
}

function decodeBasicEntities(value: string) {
    return value
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function stripTags(value: string) {
    return decodeBasicEntities(
        value
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
            .replace(/<li[^>]*>/gi, "• ")
            .replace(/<[^>]+>/g, "")
    ).replace(/\n{3,}/g, "\n\n").trim();
}

type HtmlBodyProps = {
    html: string;
    style?: StyleProp<TextStyle>;
};

export function HtmlBody({ html, style }: HtmlBodyProps) {
    const source = html?.trim() ?? "";
    return (
        <Text style={style}>
            {looksLikeHtml(source) ? stripTags(source) : source}
        </Text>
    );
}
