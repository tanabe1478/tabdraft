type Locale = "en" | "ja";

const translations = {
  en: {
    settings: "Settings",
    theme: "Theme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    themeMonokai: "Monokai",
    themeCustom: "Custom",
    customCSS: "Custom CSS",
    resetTemplate: "Reset Template",
    textAlign: "Text Alignment",
    textAlignLeft: "Left",
    textAlignCenter: "Center",
    fontSize: "Font Size",
    headingSize: "Heading Style",
    headingSizeLarge: "Large",
    headingSizeNormal: "Flat (same as body)",
    panels: "Panels",
    showTodo: "Show TODO panel",
    shortcuts: "Keyboard Shortcuts",
    focusTodo: "Focus TODO",
    focusEditor: "Focus Editor",
    pressKey: "Press a key...",
    resetDefaults: "Reset Defaults",
    cancel: "Cancel",
    save: "Save",
    addPlaceholder: "Add a task...",
    add: "+",
    editorPlaceholder: "Start writing in Markdown...",
    todo: "TODO",
  },
  ja: {
    settings: "設定",
    theme: "テーマ",
    themeSystem: "システム設定に合わせる",
    themeLight: "Light",
    themeDark: "Dark",
    themeMonokai: "Monokai",
    themeCustom: "Custom",
    customCSS: "カスタムCSS",
    resetTemplate: "テンプレートに戻す",
    textAlign: "テキスト配置",
    textAlignLeft: "左寄せ",
    textAlignCenter: "中央",
    fontSize: "文字サイズ",
    headingSize: "見出しスタイル",
    headingSizeLarge: "大きく表示",
    headingSizeNormal: "本文と同じ",
    panels: "パネル",
    showTodo: "TODOパネルを表示",
    shortcuts: "キーボードショートカット",
    focusTodo: "TODOにフォーカス",
    focusEditor: "エディタにフォーカス",
    pressKey: "キーを入力...",
    resetDefaults: "デフォルトに戻す",
    cancel: "キャンセル",
    save: "保存",
    addPlaceholder: "タスクを追加...",
    add: "+",
    editorPlaceholder: "Markdownを入力...",
    todo: "TODO",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

function detectLocale(): Locale {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("ja")) return "ja";
  return "en";
}

const currentLocale = detectLocale();

export function t(key: TranslationKey): string {
  return translations[currentLocale][key];
}
