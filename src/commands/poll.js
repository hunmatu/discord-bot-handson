import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

/**
 * pollコマンド
 *
 * 投票（アンケート）を作成するコマンド。
 * リアクション（絵文字）を使った投票機能を学べます。
 */
export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('投票を作成します')
    // 必須オプション: 投票のテーマ
    .addStringOption(option =>
      option
        .setName('質問')
        .setDescription('投票の質問内容')
        .setRequired(true) // 必須項目
    )
    // オプション: 選択肢1
    .addStringOption(option =>
      option
        .setName('選択肢1')
        .setDescription('1つ目の選択肢')
        .setRequired(true)
    )
    // オプション: 選択肢2
    .addStringOption(option =>
      option
        .setName('選択肢2')
        .setDescription('2つ目の選択肢')
        .setRequired(true)
    )
    // オプション: 選択肢3（任意）
    .addStringOption(option =>
      option
        .setName('選択肢3')
        .setDescription('3つ目の選択肢（任意）')
        .setRequired(false)
    )
    // オプション: 選択肢4（任意）
    .addStringOption(option =>
      option
        .setName('選択肢4')
        .setDescription('4つ目の選択肢（任意）')
        .setRequired(false)
    ),

  async execute(interaction) {
    // 各オプションの値を取得
    const question = interaction.options.getString('質問');
    const option1 = interaction.options.getString('選択肢1');
    const option2 = interaction.options.getString('選択肢2');
    const option3 = interaction.options.getString('選択肢3');
    const option4 = interaction.options.getString('選択肢4');

    // 選択肢を配列にまとめる（nullでないものだけ）
    const options = [option1, option2, option3, option4].filter(opt => opt !== null);

    // 絵文字のリスト（選択肢の数だけ使用）
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

    // 投票の内容を構築
    let description = '';
    for (let i = 0; i < options.length; i++) {
      description += `${emojis[i]} ${options[i]}\n`;
    }

    /**
     * 投票用のEmbedを作成
     */
    const pollEmbed = new EmbedBuilder()
      .setTitle('📊 投票')
      .setDescription(`**${question}**\n\n${description}`)
      .setColor(0x57F287) // 緑色
      .setFooter({
        text: `作成者: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    // メッセージを送信
    const message = await interaction.reply({
      embeds: [pollEmbed],
      fetchReply: true // 送信したメッセージオブジェクトを取得
    });

    /**
     * リアクション（絵文字）を追加
     * ユーザーはこれらの絵文字をクリックして投票できます
     */
    try {
      for (let i = 0; i < options.length; i++) {
        await message.react(emojis[i]);
      }
    } catch (error) {
      console.error('❌ リアクション追加エラー:', error);
      // エラーが発生してもBotは止めない
    }
  },
};
