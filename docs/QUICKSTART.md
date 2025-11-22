# クイックスタートガイド

5分でDiscord Botを動かすための最短手順です。

## ⚡ 手順

### 1. Node.js のインストール確認

```bash
node --version
```

v16.9.0以上であることを確認してください。

### 2. プロジェクトのセットアップ

```bash
# 依存パッケージをインストール
npm install

# 環境変数ファイルを作成
copy .env.example .env  # Windowsの場合
# cp .env.example .env  # Mac/Linuxの場合
```

### 3. Discord Developer Portal での設定

#### 3-1. アプリケーション作成

1. https://discord.com/developers/applications にアクセス
2. 「New Application」をクリック
3. 名前を入力して「Create」

#### 3-2. Bot作成とトークン取得

1. 左メニュー「Bot」を選択
2. 「Add Bot」をクリック
3. 「Reset Token」→トークンをコピー

#### 3-3. 必要な権限を有効化

「Bot」ページで以下を有効化:
- ✅ SERVER MEMBERS INTENT
- ✅ MESSAGE CONTENT INTENT

#### 3-4. CLIENT_ID と GUILD_ID の取得

**CLIENT_ID:**
- 左メニュー「General Information」
- 「APPLICATION ID」をコピー

**GUILD_ID:**
- Discordアプリで開発者モードを有効化（設定→詳細設定→開発者モード）
- サーバーを右クリック→「IDをコピー」

#### 3-5. Botを招待

1. 左メニュー「OAuth2」→「URL Generator」
2. SCOPES: `bot`, `applications.commands` を選択
3. BOT PERMISSIONS: 以下を選択
   - Send Messages
   - Use Slash Commands
   - Add Reactions
   - Read Message History
4. 生成されたURLをブラウザで開き、サーバーを選択

### 4. 環境変数の設定

`.env` ファイルを編集:

```env
DISCORD_TOKEN=あなたのBotトークン
CLIENT_ID=あなたのクライアントID
GUILD_ID=あなたのサーバーID
```

### 5. コマンドを登録

```bash
npm run deploy-commands
```

成功すると以下のように表示されます:

```
✨ 3個のスラッシュコマンドの登録に成功しました！
```

### 6. Botを起動

```bash
npm start
```

成功すると以下のように表示されます:

```
🤖 ログイン成功: YourBot#1234
```

### 7. コマンドを試す

Discordのチャットで以下を入力:

```
/ping
/userinfo
/poll 質問:好きな色は? 選択肢1:赤 選択肢2:青
```

---

## 🎉 成功！

Botが正常に動作したら、[チュートリアル](./TUTORIAL.md)でさらに詳しく学びましょう。

---

## ⚠️ うまくいかない場合

### コマンドが表示されない

```bash
# コマンドを再登録
npm run deploy-commands

# Discordアプリを再起動
```

### Botがオンラインにならない

1. `.env` のトークンが正しいか確認
2. Developer Portal でトークンがリセットされていないか確認
3. ターミナルのエラーメッセージを確認

### Permission エラー

1. Bot招待時に必要な権限を選択したか確認
2. Developer Portal で Intents を有効化したか確認

---

詳しくは [README.md](../README.md) を参照してください。
