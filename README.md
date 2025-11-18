# S-ken Website

静的サイト + Vue 3 (CDN) 構成です。GitHub Pages で自動デプロイされます。

## ローカルでプレビュー
VS Code の Live Server などの拡張を使うのが簡単です。拡張がない場合は PowerShell で一時サーバーを起動できます。

```powershell
# ドキュメントルートに移動して実行
cd c:\Users\106no\Documents\GitHub\skenhub.github.io
python -m http.server 8080
# → http://localhost:8080 をブラウザで開く
```

## 構成
- `index.html`: 単一ページアプリ (Vue) 本体。ナビゲーション、カルーセル、各セクションを含みます。
- `script.js`: Vue 3 の状態管理・ブログフィード取得。
- `style.css`: 追加スタイル。
- `photos/`: トップのカルーセル画像用。ファイルが無い場合は自動でプレースホルダー画像を表示します。
- `.github/workflows/deploy.yml`: main ブランチに push すると GitHub Pages へ配信します。

## 画像差し替え
`photos/1.jpg` ～ `photos/5.jpg` を実際の写真に置き換えると、カルーセルに反映されます。サイズは横 1200px 程度・アスペクト比 3:1 が目安です。

## 編集のコツ
- ナビバーから `currentPage` を切り替えることで SPA 内のページ遷移を実装しています。
- ブログは Blogger の RSS を `rss2json` 経由で 5 件まで表示します。表示件数は `script.js` で調整できます。
