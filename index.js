const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const http = require('http');
require('dotenv').config();

// 1. TẠO WEB SERVER ĐỂ RENDER KHÔNG TẮT BOT (Dành cho gói Free)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!');
});
server.listen(process.env.PORT || 3000);

// 2. KHỞI TẠO BOT
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

client.once('ready', () => {
    console.log(`Bot đã sẵn sàng! Đăng nhập: ${client.user.tag}`);
});

// Lệnh !setup để gửi khung tin nhắn
client.on('messageCreate', async (message) => {
    if (message.content === '!setup') {
        const ticketEmbed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('📅 Đặt Lịch Dịch Vụ')
            .setDescription('Nhấn vào nút **Đặt Lịch Ngay** bên dưới để mở yêu cầu hỗ trợ.')
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: 'Hệ thống tự động', iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Đặt Lịch Ngay')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎫')
        );

        await message.channel.send({ embeds: [ticketEmbed], components: [row] });
    }
});

// XỬ LÝ NÚT BẤM (Đã sửa lỗi "Tương tác không thành công")
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'create_ticket') {
        
        // Phản hồi ngay lập tức để tránh lỗi Timeout
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

            await interaction.editReply({ content: `✅ Đã tạo ticket thành công tại: ${channel}` });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Lỗi: Bot không có quyền tạo kênh. Vui lòng cấp quyền Administrator cho bot.' });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);