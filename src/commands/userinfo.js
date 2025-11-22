import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

/**
 * userinfoコマンド
 *
 * ユーザーの情報を表示するコマンド。
 * Embedメッセージの使い方を学べます。
 */
export default {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('ユーザー情報を表示します')
    // オプションを追加: 情報を見たいユーザーを選択できる
    .addUserOption(option =>
      option
        .setName('ユーザー')
        .setDescription('情報を表示するユーザー（省略時は自分）')
        .setRequired(false) // 必須ではない（省略可能）
    ),

  async execute(interaction) {
    // オプションからユーザーを取得
    // 指定されていない場合は、コマンド実行者を使用
    const targetUser = interaction.options.getUser('ユーザー') || interaction.user;

    // サーバーメンバー情報を取得（サーバー固有の情報が含まれる）
    const member = await interaction.guild.members.fetch(targetUser.id);

    /**
     * Embedを作成
     * Embedは見栄えの良い、リッチな埋め込みメッセージです
     */
    const embed = new EmbedBuilder()
      // タイトルと色を設定
      .setTitle('👤 ユーザー情報')
      .setColor(0x5865F2) // Discord Blurple色（16進数カラーコード）

      // ユーザーのアイコンを右上に表示
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))

      // フィールドを追加（名前と値のペア）
      .addFields(
        {
          name: '🏷️ ユーザー名',
          value: targetUser.tag, // 例: "User#1234"
          inline: true // 横並びで表示
        },
        {
          name: '🆔 ユーザーID',
          value: targetUser.id,
          inline: true
        },
        {
          name: '📅 アカウント作成日',
          // タイムスタンプを Discord の日付フォーマットで表示
          // <t:timestamp:F> は「年月日 時:分」形式で表示されます
          value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`,
          inline: false // 一行全体を使う
        },
        {
          name: '📥 サーバー参加日',
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
          inline: false
        },
        {
          name: '🎨 ロール',
          // ユーザーが持っているロールを表示（@everyoneを除く）
          value: member.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => role.toString())
            .join(', ') || 'なし',
          inline: false
        }
      )

      // フッター（下部の小さなテキスト）
      .setFooter({
        text: `実行者: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })

      // タイムスタンプ（現在時刻）
      .setTimestamp();

    // Embedを含む返信を送信
    await interaction.reply({ embeds: [embed] });
  },
};
