import { useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";
import { EditorView, keymap, placeholder as cmPlaceholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

interface MarkdownPanelProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export interface MarkdownPanelHandle {
  focus: () => void;
}

const markdownHighlight = HighlightStyle.define([
  { tag: tags.heading1, fontSize: "1.6em", fontWeight: "bold" },
  { tag: tags.heading2, fontSize: "1.4em", fontWeight: "bold" },
  { tag: tags.heading3, fontSize: "1.2em", fontWeight: "bold" },
  { tag: tags.heading4, fontSize: "1.1em", fontWeight: "bold" },
  { tag: tags.heading5, fontSize: "1.05em", fontWeight: "bold" },
  { tag: tags.heading6, fontSize: "1em", fontWeight: "bold" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: "#58a6ff", textDecoration: "underline" },
  { tag: tags.url, color: "#58a6ff" },
  { tag: tags.monospace, fontFamily: "monospace", color: "#e6b450" },
  { tag: tags.quote, color: "#8b949e", fontStyle: "italic" },
  { tag: tags.processingInstruction, color: "#8b949e" },
]);

const theme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "14px",
  },
  ".cm-editor": {
    height: "100%",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif",
    lineHeight: "1.7",
  },
  ".cm-content": {
    padding: "12px 16px",
    caretColor: "var(--text-primary, #c9d1d9)",
  },
  ".cm-line": {
    padding: "0",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--text-primary, #c9d1d9)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "rgba(56, 139, 253, 0.3) !important",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-placeholder": {
    color: "var(--text-muted, #484f58)",
  },
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
          cmPlaceholder("Markdownを入力..."),
          EditorView.lineWrapping,
          keymap.of([]),
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
        <h2 className="panel-title">Markdown</h2>
        <div className="editor-container">
          <div className="codemirror-wrapper" ref={containerRef} />
        </div>
      </section>
    );
  }
);
