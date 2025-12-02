# Discord Bot ハンズオン

Discord.js v14を使用したDiscord Botの作り方を学ぶハンズオン用サンプルアプリケーションです。

## 📋 目次

- [必要な環境](#必要な環境)
- [事前準備](#事前準備)
- [セットアップ手順](#セットアップ手順)
- [Botの起動方法](#botの起動方法)
  - [Dockerでの起動（推奨）](#dockerでの起動推奨)
- [実装されている機能](#実装されている機能)
- [プロジェクト構成](#プロジェクト構成)
- [コマンドの追加方法](#コマンドの追加方法)
- [トラブルシューティング](#トラブルシューティング)
- [学習のポイント](#学習のポイント)

---

## 必要な環境

- **Node.js**: v16.9.0 以上（推奨: v18 LTS以上）
- **npm**: Node.jsに同梱
- **Discordアカウント**
- **テスト用のDiscordサーバー**（自分が管理者権限を持つサーバー）

---

## 事前準備

### 1. Discord Bot アプリケーションの作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリックして、アプリケーション名を入力
3. 作成したアプリケーションを選択

### 2. Bot の作成とトークン取得

1. 左側メニューから「Bot」を選択
2. 「Add Bot」をクリック
3. 「Reset Token」をクリックして、トークンをコピー（後で使用）
   - ⚠️ **重要**: トークンは他人に見せないでください！

### 3. 必要な権限の設定

1. 「Bot」ページで以下の設定を有効化:
   - **Privileged Gateway Intents**
     - ✅ SERVER MEMBERS INTENT（サーバーメンバー情報取得用）
     - ✅ MESSAGE CONTENT INTENT（メッセージ内容取得用、今回は不要だが将来的に）

### 4. Bot の招待

1. 左側メニューから「OAuth2」→「URL Generator」を選択
2. **SCOPES**で以下を選択:
   - ✅ `bot`
   - ✅ `applications.commands`
3. **BOT PERMISSIONS**で以下を選択:
   - ✅ Send Messages
   - ✅ Use Slash Commands
   - ✅ Add Reactions
   - ✅ Read Message History
4. 生成されたURLをブラウザで開き、自分のサーバーにBotを追加

### 5. サーバーIDの取得

1. Discordアプリで「設定」→「詳細設定」→「開発者モード」を有効化
2. サーバー（Guild）を右クリック→「IDをコピー」

### 6. クライアントIDの取得

1. Discord Developer Portalで自分のアプリケーションページへ
2. 「General Information」タブの「APPLICATION ID」をコピー

---

## セットアップ手順

### 1. リポジトリのクローンまたはダウンロード

```bash
# クローンする場合
git clone <repository-url>
cd discord-bot-handson

# または、ZIPでダウンロードして解凍
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成:

```bash
# Windowsの場合
copy .env.example .env

# Mac/Linuxの場合
cp .env.example .env
```

`.env` ファイルを編集して、以下の値を設定:

```env
DISCORD_TOKEN=あなたのBotトークン
CLIENT_ID=あなたのクライアントID
GUILD_ID=あなたのサーバーID
```

### 4. コマンドの登録

BotのスラッシュコマンドをDiscordに登録します:

```bash
npm run deploy-commands
```

成功すると、以下のようなメッセージが表示されます:

```
✅ コマンド読み込み: ping
✅ コマンド読み込み: userinfo
✅ コマンド読み込み: poll
✨ 3個のスラッシュコマンドの登録に成功しました！
```

---

## Botの起動方法

### 通常起動

```bash
npm start
```

### 開発モード（ファイル変更時に自動再起動）

```bash
npm run dev
```

起動に成功すると、以下のようなメッセージが表示されます:

```
✅ コマンド読み込み成功: ping
✅ コマンド読み込み成功: userinfo
✅ コマンド読み込み成功: poll
🤖 ログイン成功: YourBot#1234
📊 3個のコマンドが登録されています
```

### Dockerでの起動（推奨）

Dockerを使用することで、環境に依存せずにBotを実行できます。

#### 前提条件
- Docker
- Docker Compose

#### コマンド登録（初回のみ）

まず、コマンドをDiscordに登録する必要があります:

```bash
# 一時的なコンテナでコマンド登録を実行
docker-compose run --rm discord-bot npm run deploy-commands
```

#### Botの起動

```bash
# バックグラウンドで起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 停止
docker-compose down
```

#### 開発時のTips

ソースコードの変更を即座に反映させたい場合は、[docker-compose.yml](docker-compose.yml) の `volumes` セクションのコメントを解除してください:

```yaml
volumes:
  - ./src:/app/src:ro
```

その後、開発モードで起動:

```bash
docker-compose run --rm discord-bot npm run dev
```

---

## 実装されている機能

### 1. `/ping` - 応答確認コマンド

Botの応答速度を確認する最もシンプルなコマンドです。

**使い方:**
```
/ping
```

**学習のポイント:**
- 基本的なコマンドの構造
- `interaction.reply()` の使い方
- WebSocketのping値の取得方法

### 2. `/userinfo` - ユーザー情報表示

ユーザーの詳細情報を表示するコマンドです。

**使い方:**
```
/userinfo
/userinfo ユーザー:@username
```

**学習のポイント:**
- コマンドオプション（引数）の扱い方
- Embedメッセージの作成方法
- ユーザー・メンバー情報の取得
- タイムスタンプの表示方法

### 3. `/poll` - 投票作成

リアクション付きの投票を作成するコマンドです。

**使い方:**
```
/poll 質問:好きな色は? 選択肢1:赤 選択肢2:青 選択肢3:緑
```

**学習のポイント:**
- 複数のオプションの扱い方
- 動的なEmbedの生成
- メッセージへのリアクション追加
- `fetchReply: true` の使い方

---

## プロジェクト構成

```
discord-bot-handson/
├── src/
│   ├── commands/           # コマンドファイルを格納
│   │   ├── ping.js        # pingコマンド
│   │   ├── userinfo.js    # userinfoコマンド
│   │   └── poll.js        # pollコマンド
│   ├── index.js           # Botのメインファイル
│   └── deploy-commands.js # コマンド登録スクリプト
├── .env                   # 環境変数（Git管理外）
├── .env.example           # 環境変数のサンプル
├── .gitignore            # Git管理対象外ファイル
├── .dockerignore         # Docker管理対象外ファイル
├── Dockerfile            # Dockerイメージ定義
├── docker-compose.yml    # Docker Compose設定
├── package.json          # プロジェクト設定
└── README.md             # このファイル
```

---

## コマンドの追加方法

新しいコマンドを追加する手順:

### 1. コマンドファイルの作成

`src/commands/` フォルダに新しいファイルを作成します。

例: `src/commands/hello.js`

```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('挨拶します'),

  async execute(interaction) {
    await interaction.reply('こんにちは！');
  },
};
```

### 2. コマンドの登録

```bash
npm run deploy-commands
```

### 3. Botの再起動

開発モードで起動している場合は自動で再起動されます。
そうでない場合は、手動で再起動してください。

### コマンドの基本構造

```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
  // コマンドの定義
  data: new SlashCommandBuilder()
    .setName('コマンド名')
    .setDescription('コマンドの説明'),

  // コマンド実行時の処理
  async execute(interaction) {
    // ここに処理を書く
    await interaction.reply('返信内容');
  },
};
```

---

## トラブルシューティング

### コマンドが表示されない

1. `npm run deploy-commands` を実行しましたか？
2. `.env` の `GUILD_ID` は正しいですか？
3. Botをサーバーに招待する際、`applications.commands` スコープを選択しましたか？

### Botがオンラインにならない

1. `.env` の `DISCORD_TOKEN` は正しいですか？
2. トークンがリセットされていませんか？
3. ターミナルにエラーメッセージが表示されていませんか？

### Permission エラーが出る

1. Botに必要な権限が付与されていますか？
2. Discord Developer Portal の Bot 設定で、必要な Intents が有効になっていますか？

### `npm install` でエラーが出る

1. Node.js のバージョンは v16.9.0 以上ですか？
   ```bash
   node --version
   ```
2. `node_modules` フォルダと `package-lock.json` を削除して、再度 `npm install` してみてください。

### Docker関連のトラブル

1. **コンテナが起動しない**
   ```bash
   # ログを確認
   docker-compose logs discord-bot
   ```

2. **.envファイルが読み込まれない**
   - `.env` ファイルがプロジェクトルートに存在することを確認
   - ファイル名が正確に `.env` であることを確認（`.env.txt` などではない）

3. **イメージを再ビルドしたい**
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **コンテナ内でコマンドを実行したい**
   ```bash
   docker-compose exec discord-bot sh
   ```

---

## 学習のポイント

### 初級編

1. **基本的なコマンドの作り方**（`ping.js`）
   - SlashCommandBuilder の使い方
   - interaction.reply() での返信

2. **環境変数の扱い方**
   - dotenv を使った設定管理
   - セキュリティの重要性

### 中級編

3. **Embedメッセージの活用**（`userinfo.js`）
   - リッチな見た目のメッセージ作成
   - フィールド、色、画像の設定

4. **オプション（引数）の扱い**
   - 必須・任意のオプション
   - 様々な型（String, User, Integer など）

5. **リアクションの追加**（`poll.js`）
   - メッセージへの絵文字リアクション
   - fetchReply の活用

### 上級編（発展課題）

6. **イベントリスナーの追加**
   - メッセージ送信イベント
   - リアクション追加イベント
   - メンバー参加/退出イベント

7. **データの永続化**
   - JSONファイルでの保存
   - データベース（SQLite, MongoDB）の利用

8. **エラーハンドリングの強化**
   - より詳細なエラーメッセージ
   - ログ管理

---

## 参考リンク

- [Discord.js 公式ドキュメント](https://discord.js.org/)
- [Discord.js ガイド](https://discordjs.guide/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord API ドキュメント](https://discord.com/developers/docs/intro)

---

## ライセンス

MIT License

---

## サポート

質問や問題がある場合は、Issueを作成してください。

Happy Coding!
