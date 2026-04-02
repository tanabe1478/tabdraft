import { useState, useEffect, useCallback } from "react";
import {
  type KeybindingMap,
  type Keybinding,
  formatKeybinding,
  captureKeybinding,
  defaultKeybindings,
} from "../keybindings";

interface SettingsDialogProps {
  readonly open: boolean;
  readonly keybindings: KeybindingMap;
  readonly onSave: (keybindings: KeybindingMap) => void;
  readonly onClose: () => void;
}

type BindingKey = keyof KeybindingMap;

const labels: Record<BindingKey, string> = {
  focusTodo: "TODOにフォーカス",
  focusEditor: "エディタにフォーカス",
  togglePreview: "プレビュー切替",
};

export function SettingsDialog({ open, keybindings, onSave, onClose }: SettingsDialogProps) {
  const [draft, setDraft] = useState<KeybindingMap>(keybindings);
  const [capturing, setCapturing] = useState<BindingKey | null>(null);

  useEffect(() => {
    if (open) setDraft(keybindings);
  }, [open, keybindings]);

  useEffect(() => {
    if (!capturing) return;

    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();
      const binding = captureKeybinding(e);
      if (binding && capturing) {
        setDraft((prev) => ({ ...prev, [capturing]: binding }));
        setCapturing(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [capturing]);

  const handleReset = useCallback(() => {
    setDraft(defaultKeybindings);
  }, []);

  const handleSave = useCallback(() => {
    onSave(draft);
    onClose();
  }, [draft, onSave, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog-title">Settings</h2>

        <h3 className="dialog-section-title">Keyboard Shortcuts</h3>
        <div className="keybinding-list">
          {(Object.keys(labels) as BindingKey[]).map((key) => (
            <div key={key} className="keybinding-row">
              <span className="keybinding-label">{labels[key]}</span>
              <button
                className={`keybinding-btn${capturing === key ? " capturing" : ""}`}
                onClick={() => setCapturing(capturing === key ? null : key)}
              >
                {capturing === key
                  ? "キーを入力..."
                  : formatKeybinding(draft[key])}
              </button>
            </div>
          ))}
        </div>

        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            デフォルトに戻す
          </button>
          <div className="dialog-actions-right">
            <button className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
