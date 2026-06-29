const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const http = require('http');
require('dotenv').config();

// Giữ server sống
const server = http.createServer((req, res) => { res.end('OK'); });
server.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.once('ready', () => {
    console.log(`Bot đã sẵn sàng! Đăng nhập: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!setup') {
        const embed = new EmbedBuilder()
            .setColor('#FF007F') // Màu hồng neon sống động
            .setTitle('🎫 HỆ THỐNG ĐẶT LỊCH HỖ TRỢ')
            .setDescription('Chào bạn! Nhấn vào nút **Đặt Lịch Ngay** để mở yêu cầu hỗ trợ riêng tư với đội ngũ của chúng tôi.')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '✅ Nhanh chóng', value: 'Phản hồi trong vài phút', inline: true },
                { name: '🔒 Bảo mật', value: 'Kênh chat riêng tư', inline: true }
            )
            .setFooter({ text: 'Hệ thống hỗ trợ 24/7', iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Đặt Lịch Ngay')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📅')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'create_ticket') {
        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
                ],
            });

            const ticketEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎉 Chào mừng bạn đến với Ticket!')
                .setDescription(`Xin chào ${interaction.user}, vui lòng nêu vấn đề của bạn, đội ngũ hỗ trợ sẽ sớm trả lời bạn!`);

            await channel.send({ content: `${interaction.user}`, embeds: [ticketEmbed] });
            await interaction.editReply({ content: `✅ Đã tạo kênh hỗ trợ riêng cho bạn: ${channel}` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Lỗi: Bot không có quyền tạo kênh!' });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);