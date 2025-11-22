import { SlashCommandBuilder } from 'discord.js';

/**
 * pingコマンド
 *
 * 最もシンプルなコマンドの例です。
 * Botの応答速度を確認したり、正常に動作しているかテストするのに使います。
 */
export default {
  /**
   * コマンドの定義
   * SlashCommandBuilderを使って、コマンドの名前と説明を設定します
   */
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botの応答速度を確認します'),

  /**
   * コマンドが実行されたときの処理
   *
   * @param {Interaction} interaction - ユーザーのインタラクション情報
   */
  async execute(interaction) {
    // interaction.client.ws.ping: WebSocketのping値（ミリ秒）
    // Discordサーバーとの通信速度を表します
    const ping = interaction.client.ws.ping;

    // ユーザーに返信
    // ephemeral: true にすると、実行者だけに見えるメッセージになります
    await interaction.reply({
      content: `🏓 Pong! (遅延: ${ping}ms)`,
      ephemeral: false, // 全員に見える返信
    });
  },
};
