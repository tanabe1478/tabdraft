import { useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";
import { EditorView, keymap, placeholder as cmPlaceholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { indentMore, indentLess } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { t } from "../i18n";

interface MarkdownPanelProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export interface MarkdownPanelHandle {
  focus: () => void;
}

const markdownHighlight = HighlightStyle.define([
  { tag: tags.heading1, class: "cm-h1" },
  { tag: tags.heading2, class: "cm-h2" },
  { tag: tags.heading3, class: "cm-h3" },
  { tag: tags.heading4, class: "cm-h4" },
  { tag: tags.heading5, class: "cm-h5" },
  { tag: tags.heading6, class: "cm-h6" },
  { tag: tags.strong, class: "cm-strong" },
  { tag: tags.emphasis, class: "cm-em" },
  { tag: tags.strikethrough, class: "cm-strikethrough" },
  { tag: tags.link, class: "cm-md-link" },
  { tag: tags.url, class: "cm-md-link" },
  { tag: tags.monospace, class: "cm-md-code" },
  { tag: tags.quote, class: "cm-md-quote" },
  { tag: tags.processingInstruction, class: "cm-md-meta" },
]);

const theme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "var(--cm-font-size, 14px)",
  },
  ".cm-editor": {
    height: "100%",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif",
    lineHeight: "var(--cm-line-height, 1.7)",
  },
  ".cm-content": {
    padding: "12px 16px",
    maxWidth: "var(--cm-content-max-width, none)",
    margin: "0 auto",
    caretColor: "var(--text)",
  },
  ".cm-line": {
    padding: "0",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--text)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "var(--cm-selection, rgba(56, 139, 253, 0.3)) !important",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-placeholder": {
    color: "var(--text-muted)",
  },
  ".cm-h1": { fontSize: "var(--cm-h1-size, 1.6em)", fontWeight: "var(--cm-heading-weight, bold)", color: "var(--cm-heading-color, var(--accent))" },
  ".cm-h2": { fontSize: "var(--cm-h2-size, 1.4em)", fontWeight: "var(--cm-heading-weight, bold)", color: "var(--cm-heading-color, var(--accent))" },
  ".cm-h3": { fontSize: "var(--cm-h3-size, 1.2em)", fontWeight: "var(--cm-heading-weight, bold)", color: "var(--cm-heading-color, var(--accent))" },
  ".cm-h4": { fontSize: "var(--cm-h4-size, 1.1em)", fontWeight: "var(--cm-heading-weight, bold)", color: "var(--cm-heading-color, var(--accent))" },
  ".cm-h5": { fontSize: "var(--cm-h5-size, 1.05em)", fontWeight: "var(--cm-heading-weight, bold)", color: "var(--cm-heading-color, var(--accent))" },
  ".cm-h6": { fontSize: "var(--cm-h6-size, 1em)", fontWeight: "var(--cm-heading-weight, bold)", color: "var(--cm-heading-color, var(--accent))" },
  ".cm-strong": { fontWeight: "bold" },
  ".cm-em": { fontStyle: "italic" },
  ".cm-strikethrough": { textDecoration: "line-through" },
  ".cm-md-link": { color: "var(--cm-heading-color, var(--accent))", textDecoration: "underline" },
  ".cm-md-code": { fontFamily: "monospace", color: "var(--cm-code)" },
  ".cm-md-quote": { fontStyle: "italic", color: "var(--text-muted)" },
  ".cm-md-meta": { color: "var(--text-muted)" },
});

export const MarkdownPanel = forwardRef<MarkdownPanelHandle, MarkdownPanelProps>(
  function MarkdownPanel({ value, onChange }, handle) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
      if (!containerRef.current) return;

      const state = EditorState.create({
        doc: value,
        extensions: [
          theme,
          markdown({ base: markdownLanguage }),
          syntaxHighlighting(markdownHighlight),
          cmPlaceholder(t("editorPlaceholder")),
          EditorView.lineWrapping,
          keymap.of([
            { key: "Tab", run: indentMore },
            { key: "Shift-Tab", run: indentLess },
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      });

      const view = new EditorView({
        state,
        parent: containerRef.current,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }, []);

    // Sync external value changes
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      const current = view.state.doc.toString();
      if (current !== value) {
        view.dispatch({
          changes: { from: 0, to: current.length, insert: value },
        });
      }
    }, [value]);

    const focusEditor = useCallback(() => {
      viewRef.current?.focus();
    }, []);

    useImperativeHandle(handle, () => ({
      focus: focusEditor,
    }));

    return (
      <section className="panel editor-panel">
        <div className="editor-container">
          <div className="codemirror-wrapper" ref={containerRef} />
        </div>
      </section>
    );
  }
);
