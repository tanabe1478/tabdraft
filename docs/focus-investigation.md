# New Tab フォーカス問題の調査記録

## 目標

Chrome拡張のNew Tabページでエディタ（textarea）に自動フォーカスしたい。
editabro（Monaco Editor使用）では実現できている。

## Chromiumの仕様

- Chrome 27以降、New TabページではOmnibox（アドレスバー）にフォーカスを強制する
- Chromium Bug #243102 として報告済み、WontFix扱い
- 公式ドキュメントにも「new tabs give keyboard focus to the address bar first」と明記

## 試したアプローチ（すべて失敗）

### 1. setTimeout/setInterval ポーリング (100ms〜1200ms)
- `chrome_url_overrides` + `element.focus()` をタイマーで繰り返し呼ぶ
- 結果: 効果なし。ページ自体にフォーカスがないため `focus()` が無視される

### 2. requestIdleCallback
- ブラウザがアイドル状態になった後に `focus()` を呼ぶ
- 結果: 効果なし

### 3. location.search リダイレクト
- `location.search = "?"` でリロードし、2回目のロードではChromeがOmniboxフォーカスをスキップする
- 結果: フォーカスの効果は未確認（黒画面チラつきが発生したため中止）
- 副作用: ページが2回ロードされる、URLに `?` が残る

### 4. location.hash 変更
- `location.hash = "#"` でフォーカスを奪う（リロードなし）
- 結果: 効果なし

### 5. chrome.tabs.update 方式
- `chrome_url_overrides` を廃止、Background Scriptで `chrome.tabs.onCreated` を監視
- 新規タブが `chrome://newtab/` の場合 `chrome.tabs.update()` でリダイレクト
- 「通常のページ遷移」として扱われるためOmniboxフォーカス強制が発動しないはず
- 結果: 効果なし。さらにカーソルが勝手に動く副作用あり
- 追加パーミッション: `tabs`, `webNavigation`

### 6. HTML autofocus 属性
- HTMLに `<textarea autofocus>` を配置（React外）
- HTMLパース時にブラウザがフォーカスを当てることを期待
- 結果: 効果なし

### 7. 同期的 DOM 構築 + focus()（Monaco模倣）
- main.tsx のモジュール実行中に同期的に `createElement("textarea")` → `appendChild` → `focus()`
- editabroでMonacoが `editor.create()` 内で同期的にフォーカスするのと同じタイミングを模倣
- 結果: 効果なし

## editabroが成功する理由（仮説）

editabro (Monaco Editor) のソースを確認:
- `autofocus` 属性もfocus()呼び出しも**一切なし**
- `monaco.editor.create()` がエディタDOMを構築、内部で自動フォーカス
- Monaco Editorは ~1MB のJSを読み込み・解析するため、初期化に数百msかかる
- この重い初期化がChromeのOmniboxフォーカス処理と絶妙なタイミングで競合し、結果的にフォーカスが残る

### editabro manifest.json
```json
{
  "manifest_version": 3,
  "chrome_url_overrides": { "newtab": "src/newtab.html" },
  "background": { "service_worker": "src/background.ts" },
  "permissions": ["storage"]
}
```

### 未検証の仮説
- Monaco Editorが内部で使う `contenteditable` div が textarea とは異なるフォーカス挙動を持つ可能性
- Monaco の Web Worker 起動がブラウザのフォーカス管理に影響する可能性
- Monaco のDOM構築量（数十のdiv, span, textarea）がChrome内部のフォーカス判定に影響する可能性
- Chrome拡張ストアからインストールした場合と開発者モードで読み込んだ場合でフォーカス挙動が異なる可能性

### 8. window.open + window.close 方式 ✅ 成功

- `chrome_url_overrides` でダミーページ（newtab.html）を登録
- ダミーページが `window.open(chrome.runtime.getURL("app.html"))` で本物のページを開き、`window.close()` で自身を閉じる
- 本物のページは「通常のナビゲーション」扱いになるため、ChromeのOmniboxフォーカス強制が発動しない
- ページ側で `requestAnimationFrame` → `focus()` を呼ぶことでtextareaにフォーカスが当たる
- 参考: https://stackoverflow.com/questions/24049408/google-chrome-extension-new-tab-focus

## 現在の状態

**解決済み**: window.open方式でフォーカス問題を解決。
- `newtab.html` → ダミーページ（redirect.ts: window.open + window.close）
- `app.html` → 本物のアプリページ（React）
- App.tsx でマウント後に `requestAnimationFrame` → `markdownRef.current?.focus()` でエディタにフォーカス
