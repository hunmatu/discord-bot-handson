// 必要なモジュールをインポート
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import express from 'express';

// .envファイルから環境変数を読み込む
dotenv.config();

// ES Modulesで__dirnameを使用するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Discord Botクライアントを作成
 *
 * Intents: Botが受信するイベントの種類を指定
 * - Guilds: サーバー(Guild)の基本情報
 * - GuildMessages: サーバー内のメッセージ
 * - GuildMembers: サーバーメンバーの情報
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

/**
 * コマンドをCollectionに格納
 * Collection: Mapの拡張版で、便利なメソッドが追加されています
 */
client.commands = new Collection();

/**
 * コマンドファイルの読み込み
 * commandsフォルダ内の.jsファイルを全て読み込み、
 * client.commandsに登録します
 */
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  // 動的インポート（ES Modules用）
  const command = await import(`file:///${filePath.replace(/\\/g, '/')}`);

  // コマンドにdataとexecuteプロパティがあることを確認
  if ('data' in command.default && 'execute' in command.default) {
    client.commands.set(command.default.data.name, command.default);
    console.log(`✅ コマンド読み込み成功: ${command.default.data.name}`);
  } else {
    console.log(`⚠️  警告: ${file} にdataまたはexecuteプロパティがありません`);
  }
}

/**
 * Botの準備完了時に実行されるイベント
 * このイベントは、Botがログインし、Discordに接続準備が完了したときに一度だけ発火します
 */
client.once(Events.ClientReady, (c) => {
  console.log(`🤖 ログイン成功: ${c.user.tag}`);
  console.log(`📊 ${client.commands.size}個のコマンドが登録されています`);
});

/**
 * スラッシュコマンドのインタラクションを処理
 * ユーザーがスラッシュコマンドを実行したときに発火します
 */
client.on(Events.InteractionCreate, async (interaction) => {
  // チャットコマンド以外のインタラクション（ボタン、セレクトメニューなど）は無視
  if (!interaction.isChatInputCommand()) return;

  // 実行されたコマンドを取得
  const command = client.commands.get(interaction.commandName);

  // コマンドが見つからない場合
  if (!command) {
    console.error(`❌ コマンドが見つかりません: ${interaction.commandName}`);
    return;
  }

  try {
    // コマンドを実行
    await command.execute(interaction);
    console.log(`✨ コマンド実行: ${interaction.commandName} by ${interaction.user.tag}`);
  } catch (error) {
    // エラーハンドリング
    console.error(`❌ コマンド実行エラー: ${interaction.commandName}`, error);

    // ユーザーにエラーメッセージを送信
    const errorMessage = {
      content: 'コマンドの実行中にエラーが発生しました。',
      ephemeral: true // このメッセージは実行者だけに表示される
    };

    // すでに返信済みかどうかで処理を分ける
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

/**
 * エラーハンドリング
 * 予期しないエラーでBotがクラッシュしないようにする
 */
process.on('unhandledRejection', (error) => {
  console.error('❌ 未処理のPromise拒否:', error);
});

/**
 * Discordにログイン
 * 環境変数からトークンを取得して、Botを起動します
 */
client.login(process.env.DISCORD_TOKEN);

/**
 * Webhook用のExpressサーバーを設定
 * 外部サービスからのWebhookを受け取り、指定されたDiscordチャンネルにメッセージを送信します
 */
const app = express();
app.use(express.json()); // JSONボディをパース

/**
 * Webhookエンドポイント
 * POST /webhook にリクエストを送信することで、Discordチャンネルにメッセージを送信できます
 *
 * リクエストボディの形式:
 * {
 *   "message": "送信するメッセージ内容",
 *   "channelId": "送信先チャンネルID（オプション）"
 * }
 */
app.post('/webhook', async (req, res) => {
  try {
    const { message, channelId } = req.body;

    // メッセージが指定されていない場合
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'メッセージが指定されていません'
      });
    }

    // チャンネルIDを取得（リクエストで指定されていない場合は環境変数から取得）
    const targetChannelId = channelId || process.env.WEBHOOK_CHANNEL_ID;

    if (!targetChannelId) {
      return res.status(400).json({
        success: false,
        error: 'チャンネルIDが指定されていません'
      });
    }

    // チャンネルを取得
    const channel = await client.channels.fetch(targetChannelId);

    if (!channel || !channel.isTextBased()) {
      return res.status(404).json({
        success: false,
        error: 'チャンネルが見つからないか、テキストチャンネルではありません'
      });
    }

    // メッセージを送信
    await channel.send(message);

    console.log(`📨 Webhookからメッセージ送信: チャンネルID ${targetChannelId}`);

    res.json({
      success: true,
      message: 'メッセージを送信しました',
      channelId: targetChannelId
    });

  } catch (error) {
    console.error('❌ Webhook処理エラー:', error);
    res.status(500).json({
      success: false,
      error: 'メッセージの送信に失敗しました'
    });
  }
});

/**
 * ヘルスチェックエンドポイント
 * サーバーが正常に動作しているか確認するためのエンドポイント
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: client.user ? client.user.tag : 'not ready'
  });
});

// Expressサーバーを起動
const PORT = process.env.WEBHOOK_PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webhookサーバーが起動しました: http://localhost:${PORT}`);
  console.log(`📍 Webhookエンドポイント: http://localhost:${PORT}/webhook`);
});
