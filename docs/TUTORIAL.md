# Discord Bot 開発チュートリアル

このドキュメントでは、Discord Bot の各機能について詳しく解説します。

## 📚 目次

1. [Discord Bot の基本概念](#discord-bot-の基本概念)
2. [コードの詳細解説](#コードの詳細解説)
3. [発展課題](#発展課題)

---

## Discord Bot の基本概念

### インテント (Intents) とは？

インテントは、Botが受信するイベントの種類を指定するものです。
プライバシー保護のため、必要なイベントのみを受信できるようになっています。

```javascript
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,        // サーバー情報
    GatewayIntentBits.GuildMessages,  // メッセージ情報
    GatewayIntentBits.GuildMembers,   // メンバー情報
  ],
});
```

**よく使うインテント:**
- `Guilds`: サーバー（Guild）の基本情報
- `GuildMessages`: サーバー内のメッセージ
- `GuildMembers`: メンバー情報（要特権インテント有効化）
- `MessageContent`: メッセージの内容（要特権インテント有効化）

### イベントとは？

Discordで何かが起きたときに発火する通知です。

**主なイベント:**
```javascript
// Bot起動時（一度だけ）
client.once(Events.ClientReady, () => {
  console.log('Bot準備完了！');
});

// インタラクション（コマンド実行など）
client.on(Events.InteractionCreate, async (interaction) => {
  // コマンド処理
});

// メッセージ送信時
client.on(Events.MessageCreate, async (message) => {
  // メッセージ処理
});

// メンバー参加時
client.on(Events.GuildMemberAdd, async (member) => {
  // 参加メッセージ送信など
});
```

### スラッシュコマンドとは？

`/` で始まる公式のコマンドシステムです。

**メリット:**
- 自動補完が効く
- 引数の型チェックが自動
- 権限管理が簡単
- UIが分かりやすい

**作成手順:**
1. コマンドを定義（`SlashCommandBuilder`）
2. Discordに登録（`deploy-commands.js`）
3. 実行処理を実装（`execute` 関数）

---

## コードの詳細解説

### 1. index.js - メインファイルの解説

#### コマンドの動的読み込み

```javascript
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file:///${filePath.replace(/\\/g, '/')}`);

  if ('data' in command.default && 'execute' in command.default) {
    client.commands.set(command.default.data.name, command.default);
  }
}
```

**ポイント:**
- `readdirSync()`: フォルダ内のファイルを全て取得
- `filter()`: `.js` ファイルのみを抽出
- 動的インポート: ES Modules で外部ファイルを読み込む
- `Collection`: Map の拡張版、Discord.js 独自のデータ構造

#### インタラクション処理のフロー

```javascript
client.on(Events.InteractionCreate, async (interaction) => {
  // 1. コマンドかどうか確認
  if (!interaction.isChatInputCommand()) return;

  // 2. コマンドを取得
  const command = client.commands.get(interaction.commandName);

  // 3. エラーハンドリング付きで実行
  try {
    await command.execute(interaction);
  } catch (error) {
    // エラー時の処理
  }
});
```

### 2. ping.js - シンプルなコマンド

```javascript
export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botの応答速度を確認します'),

  async execute(interaction) {
    const ping = interaction.client.ws.ping;
    await interaction.reply(`🏓 Pong! (遅延: ${ping}ms)`);
  },
};
```

**重要概念:**
- `ws.ping`: WebSocket の ping 値（ミリ秒）
- `interaction.reply()`: ユーザーへの返信（3秒以内に必須）

**返信の種類:**
```javascript
// 通常の返信（全員に見える）
await interaction.reply('メッセージ');

// エフェメラル返信（実行者だけに見える）
await interaction.reply({
  content: 'メッセージ',
  ephemeral: true
});

// 返信を遅らせる（処理に時間がかかる場合）
await interaction.deferReply();
// 処理...
await interaction.editReply('完了しました');
```

### 3. userinfo.js - オプションとEmbed

#### オプションの定義

```javascript
.addUserOption(option =>
  option
    .setName('ユーザー')
    .setDescription('情報を表示するユーザー')
    .setRequired(false) // 任意項目
)
```

**オプションの種類:**
- `addStringOption`: 文字列
- `addIntegerOption`: 整数
- `addBooleanOption`: true/false
- `addUserOption`: ユーザー選択
- `addChannelOption`: チャンネル選択
- `addRoleOption`: ロール選択

#### Embedメッセージの構造

```javascript
const embed = new EmbedBuilder()
  .setTitle('タイトル')                    // タイトル
  .setDescription('説明文')                // 説明
  .setColor(0x5865F2)                     // 色（16進数）
  .setThumbnail('画像URL')                 // サムネイル（右上）
  .setImage('画像URL')                     // 大きな画像
  .addFields(                             // フィールド追加
    { name: '名前1', value: '値1', inline: true },
    { name: '名前2', value: '値2', inline: false }
  )
  .setFooter({ text: 'フッター', iconURL: 'アイコンURL' })
  .setTimestamp();                        // 現在時刻
```

**色の指定方法:**
```javascript
.setColor(0x5865F2)        // 16進数
.setColor('#5865F2')       // カラーコード
.setColor('Blue')          // 色名
.setColor([88, 101, 242])  // RGB
```

#### タイムスタンプの表示

```javascript
// Discord形式のタイムスタンプ
`<t:${Math.floor(timestamp / 1000)}:F>`
```

**フォーマット一覧:**
- `F`: 完全な日時（例: 2024年1月1日 12:00）
- `f`: 短い日時（例: 2024/1/1 12:00）
- `D`: 日付のみ（例: 2024年1月1日）
- `R`: 相対時間（例: 3時間前）

### 4. poll.js - リアクションの活用

```javascript
// メッセージを送信して、オブジェクトを取得
const message = await interaction.reply({
  embeds: [pollEmbed],
  fetchReply: true // これがないとメッセージオブジェクトが取得できない
});

// リアクションを追加
for (let i = 0; i < options.length; i++) {
  await message.react(emojis[i]);
}
```

**ポイント:**
- `fetchReply: true`: 送信したメッセージオブジェクトを取得
- `message.react()`: 絵文字リアクションを追加
- 絵文字は Unicode または カスタム絵文字ID を使用

---

## 発展課題

### 課題1: サーバー情報コマンド

サーバーの情報を表示する `/serverinfo` コマンドを作成してください。

**表示する情報:**
- サーバー名
- サーバーアイコン
- メンバー数
- チャンネル数
- 作成日

**ヒント:**
```javascript
const guild = interaction.guild;
console.log(guild.name);          // サーバー名
console.log(guild.memberCount);   // メンバー数
console.log(guild.channels.cache.size); // チャンネル数
```

### 課題2: 計算機コマンド

2つの数値を受け取って計算する `/calc` コマンドを作成してください。

**仕様:**
- オプション: `数値1`, `演算子`, `数値2`
- 演算子: `+`, `-`, `*`, `/`
- 結果を表示

**ヒント:**
```javascript
.addIntegerOption(option =>
  option.setName('数値1').setDescription('1つ目の数値').setRequired(true)
)
.addStringOption(option =>
  option.setName('演算子')
    .setDescription('演算子')
    .setRequired(true)
    .addChoices( // 選択肢を限定
      { name: '足し算 (+)', value: '+' },
      { name: '引き算 (-)', value: '-' },
      { name: '掛け算 (*)', value: '*' },
      { name: '割り算 (/)', value: '/' }
    )
)
```

### 課題3: ウェルカムメッセージ

新しいメンバーが参加したときに歓迎メッセージを送るイベントを実装してください。

**仕様:**
- `GuildMemberAdd` イベントを使用
- 特定のチャンネルにメッセージを送信
- Embedで見栄え良く

**ヒント:**
```javascript
// index.js に追加
client.on(Events.GuildMemberAdd, async (member) => {
  const channel = member.guild.channels.cache.get('チャンネルID');
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle('ようこそ！')
    .setDescription(`${member}さん、サーバーへようこそ！`)
    .setColor(0x57F287);

  await channel.send({ embeds: [embed] });
});
```

### 課題4: リアクションロール

特定のメッセージにリアクションすることでロールを付与する機能を実装してください。

**仕様:**
- 管理者がリアクションロールのメッセージを作成
- ユーザーがリアクションするとロール付与
- リアクションを外すとロール削除

**必要なイベント:**
- `MessageReactionAdd`
- `MessageReactionRemove`

### 課題5: データの永続化

投票結果を保存して、後から集計できるようにしてください。

**方法:**
- JSON ファイルに保存
- または SQLite などのデータベース使用

**ヒント:**
```javascript
import { writeFileSync, readFileSync } from 'fs';

// データ保存
const data = { polls: [] };
writeFileSync('data.json', JSON.stringify(data, null, 2));

// データ読み込み
const data = JSON.parse(readFileSync('data.json', 'utf8'));
```

---

## よくある質問 (FAQ)

### Q1: コマンドの変更が反映されない

A: コマンドの定義（name, description, options）を変更した場合は、
再度 `npm run deploy-commands` を実行する必要があります。
実行処理（execute関数）のみの変更なら、Botの再起動だけで大丈夫です。

### Q2: "Unknown Interaction" エラーが出る

A: Discordは3秒以内に返信しないとタイムアウトします。
処理に時間がかかる場合は `deferReply()` を使いましょう。

```javascript
async execute(interaction) {
  await interaction.deferReply(); // 先に応答
  // 時間がかかる処理...
  await interaction.editReply('完了！');
}
```

### Q3: カスタム絵文字を使いたい

A: カスタム絵文字のIDを使用します。

```javascript
// カスタム絵文字のIDを取得（開発者モードで絵文字を右クリック）
const emoji = '<:emoji_name:123456789012345678>';
await message.react('123456789012345678');
```

### Q4: DMでコマンドを使えるようにしたい

A: `setDMPermission(true)` を使用します。

```javascript
data: new SlashCommandBuilder()
  .setName('ping')
  .setDescription('説明')
  .setDMPermission(true) // DMで使用可能
```

---

## 次のステップ

1. **公式ドキュメントを読む**: [Discord.js Guide](https://discordjs.guide/)
2. **他のBotを参考にする**: GitHub で "discord bot" を検索
3. **コミュニティに参加**: Discord.js 公式サーバーなど
4. **実際に作ってみる**: 自分のアイデアを形にする

---

Happy Coding!
