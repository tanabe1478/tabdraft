import { useState, useEffect, useCallback } from "react";
import {
  type KeybindingMap,
  type Settings,
  type Theme,
  type TextAlign,
  formatKeybinding,
  captureKeybinding,
  defaultKeybindings,
  defaultSettings,
} from "../keybindings";
import { generateCustomTemplate } from "../themes";
import { t } from "../i18n";

interface SettingsDialogProps {
  readonly open: boolean;
  readonly keybindings: KeybindingMap;
  readonly settings: Settings;
  readonly onSave: (keybindings: KeybindingMap, settings: Settings) => void;
  readonly onClose: () => void;
}

type BindingKey = keyof KeybindingMap;

const bindingLabels: Record<BindingKey, () => string> = {
  focusTodo: () => t("focusTodo"),
  focusEditor: () => t("focusEditor"),
};

const themeOptions: { value: Theme; label: () => string }[] = [
  { value: "system", label: () => t("themeSystem") },
  { value: "light", label: () => t("themeLight") },
  { value: "dark", label: () => t("themeDark") },
  { value: "monokai", label: () => t("themeMonokai") },
  { value: "custom", label: () => t("themeCustom") },
];

export function SettingsDialog({ open, keybindings, settings, onSave, onClose }: SettingsDialogProps) {
  const [draft, setDraft] = useState<KeybindingMap>(keybindings);
  const [draftSettings, setDraftSettings] = useState<Settings>(settings);
  const [capturing, setCapturing] = useState<BindingKey | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(keybindings);
      setDraftSettings(settings);
    }
  }, [open, keybindings, settings]);

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
    setDraftSettings(defaultSettings);
  }, []);

  const handleSave = useCallback(() => {
    onSave(draft, draftSettings);
    onClose();
  }, [draft, draftSettings, onSave, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog-title">{t("settings")}</h2>

        <h3 className="dialog-section-title">{t("theme")}</h3>
        <div className="setting-row">
          <select
            className="setting-select"
            value={draftSettings.theme}
            onChange={(e) =>
              setDraftSettings({ ...draftSettings, theme: e.target.value as Theme })
            }
          >
            {themeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label()}
              </option>
            ))}
          </select>
        </div>

        {draftSettings.theme === "custom" && (
          <div className="setting-row">
            <div className="custom-css-header">
              <span className="custom-css-label">{t("customCSS")}</span>
              <button
                className="btn btn-secondary btn-small"
                onClick={() =>
                  setDraftSettings({ ...draftSettings, customCSS: generateCustomTemplate() })
                }
              >
                {t("resetTemplate")}
              </button>
            </div>
            <textarea
              className="custom-css-editor"
              rows={14}
              spellCheck={false}
              value={draftSettings.customCSS || generateCustomTemplate()}
              onChange={(e) =>
                setDraftSettings({ ...draftSettings, customCSS: e.target.value })
              }
            />
          </div>
        )}

        {draftSettings.theme !== "custom" && (
          <>
            <h3 className="dialog-section-title">{t("textAlign")}</h3>
            <div className="setting-row">
              <select
                className="setting-select"
                value={draftSettings.textAlign}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, textAlign: e.target.value as TextAlign })
                }
              >
                <option value="left">{t("textAlignLeft")}</option>
                <option value="center">{t("textAlignCenter")}</option>
              </select>
            </div>

            <h3 className="dialog-section-title">{t("fontSize")}</h3>
            <div className="setting-row setting-row-inline">
              <input
                type="range"
                min={12}
                max={24}
                value={draftSettings.fontSize}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, fontSize: Number(e.target.value) })
                }
              />
              <span className="setting-value">{draftSettings.fontSize}px</span>
            </div>

            <h3 className="dialog-section-title">{t("headingSize")}</h3>
            <div className="setting-row">
              <select
                className="setting-select"
                value={draftSettings.headingSize}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, headingSize: e.target.value as "normal" | "large" })
                }
              >
                <option value="large">{t("headingSizeLarge")}</option>
                <option value="normal">{t("headingSizeNormal")}</option>
              </select>
            </div>
          </>
        )}

        <h3 className="dialog-section-title">{t("panels")}</h3>
        <div className="setting-row">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={draftSettings.showTodo}
              onChange={(e) =>
                setDraftSettings({ ...draftSettings, showTodo: e.target.checked })
              }
            />
            {t("showTodo")}
          </label>
        </div>

        <h3 className="dialog-section-title">{t("shortcuts")}</h3>
        <div className="keybinding-list">
          {(Object.keys(bindingLabels) as BindingKey[]).map((key) => (
            <div key={key} className="keybinding-row">
              <span className="keybinding-label">{bindingLabels[key]()}</span>
              <button
                className={`keybinding-btn${capturing === key ? " capturing" : ""}`}
                onClick={() => setCapturing(capturing === key ? null : key)}
              >
                {capturing === key
                  ? t("pressKey")
                  : formatKeybinding(draft[key])}
              </button>
            </div>
          ))}
        </div>

        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            {t("resetDefaults")}
          </button>
          <div className="dialog-actions-right">
            <button className="btn btn-secondary" onClick={onClose}>
              {t("cancel")}
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              {t("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
