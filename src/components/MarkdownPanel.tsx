import { useState, useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from "react";
import TextareaMarkdown, { type TextareaMarkdownRef } from "textarea-markdown-editor";
import type { Command } from "textarea-markdown-editor";
import { marked } from "marked";

interface MarkdownPanelProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export interface MarkdownPanelHandle {
  focus: () => void;
  togglePreview: () => void;
}

type Tab = "edit" | "preview";

function renderMarkdown(source: string): string {
  if (source.trim() === "") {
    return '<p style="color: var(--text-muted)">プレビューがここに表示されます</p>';
  }
  return marked.parse(source, { async: false }) as string;
}

// Disable shortcuts that conflict with Emacs keybindings (Ctrl+B, Ctrl+I, etc.)
const commands: Command[] = [
  { name: "bold", enable: false },
  { name: "italic", enable: false },
  { name: "strike-through", enable: false },
];

export const MarkdownPanel = forwardRef<MarkdownPanelHandle, MarkdownPanelProps>(
  function MarkdownPanel({ value, onChange }, handle) {
    const [tab, setTab] = useState<Tab>("edit");
    const mdRef = useRef<TextareaMarkdownRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Block keydown events during IME composition so textarea-markdown-editor
    // doesn't intercept Enter for list-continuation while composing Japanese.
    useEffect(() => {
      const container = containerRef.current;
      if (!container || tab !== "edit") return;

      function blockDuringCompose(e: Event) {
        if ((e as KeyboardEvent).isComposing) {
          e.stopPropagation();
        }
      }

      // Capture phase runs before textarea-markdown-editor's handlers
      container.addEventListener("keydown", blockDuringCompose, true);
      return () => container.removeEventListener("keydown", blockDuringCompose, true);
    }, [tab]);

    const focusTextarea = useCallback(() => {
      mdRef.current?.focus();
    }, []);

    const switchToEdit = useCallback(() => {
      setTab("edit");
      setTimeout(() => mdRef.current?.focus(), 0);
    }, []);

    const switchToPreview = useCallback(() => {
      setTab("preview");
    }, []);

    useImperativeHandle(handle, () => ({
      focus() {
        if (tab === "preview") {
          switchToEdit();
        } else {
          focusTextarea();
        }
      },
      togglePreview() {
        if (tab === "edit") switchToPreview();
        else switchToEdit();
      },
    }));


    return (
      <section className="panel editor-panel">
        <h2 className="panel-title">Markdown</h2>
        <div className="editor-container" ref={containerRef}>
          <div className="editor-tabs">
            <button
              className={`tab-btn${tab === "edit" ? " active" : ""}`}
              onClick={switchToEdit}
            >
              Edit
            </button>
            <button
              className={`tab-btn${tab === "preview" ? " active" : ""}`}
              onClick={switchToPreview}
            >
              Preview
            </button>
          </div>
          {tab === "edit" ? (
            <TextareaMarkdown
              ref={mdRef}
              className="markdown-editor"
              placeholder="Markdownを入力..."
              spellCheck={false}
              value={value}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
              commands={commands}
            />
          ) : (
            <div
              className="markdown-preview"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  switchToEdit();
                }
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          )}
        </div>
      </section>
    );
  }
);
