// Discord APIとの通信に必要なモジュールをインポート
import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

// 環境変数を読み込む
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * コマンドデプロイスクリプト
 *
 * このスクリプトは、作成したスラッシュコマンドをDiscordに登録します。
 * コマンドを追加・変更した際には、このスクリプトを実行する必要があります。
 */

const commands = [];

// commandsフォルダからコマンドファイルを読み込む
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// 各コマンドファイルからコマンド定義を取得
for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file:///${filePath.replace(/\\/g, '/')}`);

  if ('data' in command.default) {
    // コマンドデータをJSON形式に変換して配列に追加
    commands.push(command.default.data.toJSON());
    console.log(`✅ コマンド読み込み: ${command.default.data.name}`);
  } else {
    console.log(`⚠️  警告: ${file} にdataプロパティがありません`);
  }
}

/**
 * Discord REST APIクライアントを作成
 * version: '10' は Discord API v10 を使用することを示します
 */
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

/**
 * コマンドをDiscordに登録する処理
 */
(async () => {
  try {
    console.log(`🔄 ${commands.length}個のスラッシュコマンドを登録中...`);

    /**
     * Discord APIにコマンドを送信
     *
     * Routes.applicationGuildCommands: 特定のサーバー(Guild)にのみコマンドを登録
     * - メリット: すぐに反映される（即座に使用可能）
     * - デメリット: 指定したサーバーでしか使えない
     *
     * 本番環境では Routes.applicationCommands を使用すると、
     * 全サーバーで使えるグローバルコマンドになりますが、
     * 反映まで最大1時間かかります。
     */
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log(`✨ ${data.length}個のスラッシュコマンドの登録に成功しました！`);
    console.log('登録されたコマンド:');
    data.forEach(cmd => console.log(`  - /${cmd.name}: ${cmd.description}`));

  } catch (error) {
    // エラーが発生した場合は詳細を出力
    console.error('❌ コマンド登録エラー:', error);

    // よくあるエラーの説明
    if (error.code === 50001) {
      console.log('\n💡 ヒント: BOTに必要な権限がありません。applications.commands スコープが必要です。');
    } else if (error.code === 10004) {
      console.log('\n💡 ヒント: GUILD_IDが正しくない可能性があります。サーバーIDを確認してください。');
    }
  }
})();
