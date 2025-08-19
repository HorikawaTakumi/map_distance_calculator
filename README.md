# 🗾 Map Distance Calculator

日本の住所間の直線距離を計算するWebアプリケーションです。

## ✨ 機能

- 📍 **住所から座標への変換** - 国土地理院住所検索APIを使用
- 📏 **高精度距離計算** - 3段階のフォールバック方式
  - Google Maps API（最優先）
  - 国土地理院測量計算API
  - Haversine公式（フォールバック）
- 🗺️ **インタラクティブ地図** - Google Maps上での位置表示・半径円描画
- 📱 **レスポンシブデザイン** - デスクトップ・タブレット・スマートフォン対応
- 🔒 **HTTPS対応** - 開発環境でも自動SSL証明書生成

## 🚀 クイックスタート

### 必要な環境

- [mise](https://mise.jdx.dev/) - ツールバージョン管理
- Node.js（npm scriptsで自動管理）
- Python（mise経由で自動インストール）

### インストール & 起動

```bash
# リポジトリをクローン
git clone <repository-url>
cd map_distance_calculator

# 依存関係をインストール・ビルド・サーバー起動（一括）
npm start
```

### 個別コマンド

```bash
# JavaScriptとSCSSをビルド
npm run build

# 開発サーバーのみ起動
npm run dev

# ファイルを監視してビルド（開発時）
npm run build:js    # JavaScript
npm run build:css   # SCSS → CSS
```

## 🌐 アクセス

- **HTTPS**: <https://localhost:3000> （推奨）
- **HTTP**: <http://localhost:3000> （SSL証明書作成に失敗した場合）

初回アクセス時は自己署名証明書の警告が表示される場合があります。

## 🗂️ プロジェクト構成

```text
├── index.html              # メインHTMLファイル
├── server.py               # Flask開発サーバー
├── package.json            # Node.js依存関係・ビルドスクリプト
├── pyproject.toml          # Python依存関係
├── .tool-versions          # mise設定（Python/uvバージョン）
├── .npmrc                  # npm設定（zshシェル指定）
│
├── src/                    # ソースコード
│   ├── js/                 # JavaScript（モジュール形式）
│   │   ├── config/         # 設定・定数
│   │   ├── api/            # API通信
│   │   ├── map/            # Google Maps操作
│   │   ├── ui/             # UI管理
│   │   ├── utils/          # ユーティリティ
│   │   └── main.js         # メインエントリーポイント
│   │
│   └── scss/               # SCSS（モジュール形式）
│       ├── base/           # ベーススタイル・変数
│       ├── layout/         # レイアウト
│       ├── components/     # コンポーネント
│       ├── utilities/      # ユーティリティ・レスポンシブ
│       └── main.scss       # メインエントリーポイント
│
└── dist/                   # ビルド出力
    ├── app.min.js          # ミニファイされたJavaScript
    └── style.min.css       # ミニファイされたCSS
```

## 🔧 技術スタック

### フロントエンド

- **HTML5/CSS3/JavaScript** - ベース技術
- **SCSS** - CSSプリプロセッサ（変数・モジュール化）
- **Google Maps API** - 地図表示・距離計算
- **レスポンシブデザイン** - モバイル対応

### バックエンド

- **Flask** - Pythonウェブフレームワーク（開発サーバー）
- **Requests** - HTTP API呼び出し

### API

- **国土地理院住所検索API** - 住所→座標変換
- **国土地理院測量計算API** - 高精度距離計算
- **Google Maps JavaScript API** - 地図表示・Geometry Library

### 開発環境

- **mise** - ツールバージョン管理（Python/uv）
- **uv** - Python パッケージマネージャー
- **npm** - Node.jsパッケージマネージャー
- **Terser** - JavaScriptミニファイ
- **CleanCSS** - CSSミニファイ

## 🔑 Google Maps API設定

地図表示機能を使用するにはGoogle Maps APIキーが必要です：

1. [Google Cloud Console](https://console.cloud.google.com/)でAPIキーを取得
2. Maps JavaScript API を有効化
3. アプリ内で「🔧 APIキー管理」からキーを設定

APIキーはブラウザのlocalStorageに保存され、次回から自動で使用されます。

## 🏗️ ビルドプロセス

### JavaScript

```bash
# モジュールファイルを結合 → ミニファイ
cat src/js/**/*.js | terser -c -m -o dist/app.min.js
```

### CSS

```bash
# SCSS → 圧縮CSS → ミニファイ
sass src/scss/main.scss --style=compressed | cleancss -o dist/style.min.css
```

## 📐 距離計算について

本アプリケーションは以下の優先順位で距離を計算します：

1. **Google Maps API** - 最も正確（地球の楕円体を考慮）
2. **国土地理院測量計算API** - 日本測地系ベッセル楕円体
3. **Haversine公式** - 球体近似（フォールバック）

計算結果には使用された方法が表示されます。

## 🔒 セキュリティ

- **HTTPS対応** - 自己署名証明書による暗号化通信
- **APIプロキシ** - Mixed Contentエラー回避
- **証明書管理** - `.certs/`フォルダ（gitignore済み）
