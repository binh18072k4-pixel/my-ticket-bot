const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
require('dotenv').config();

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

// Lệnh !setup để tạo tin nhắn mới
client.on('messageCreate', async (message) => {
    if (message.content === '!setup') {
        const ticketEmbed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('📅 Đặt Lịch Dịch Vụ')
            .setDescription('Nhấn vào nút bên dưới để bắt đầu đặt lịch!')
            .setFooter({ text: 'Hệ thống hỗ trợ tự động' });

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

// XỬ LÝ NÚT BẤM (Tối ưu để không bị treo)
client.on('interactionCreate', async (interaction) => {
    // Dòng này giúp bạn kiểm tra trong Logs xem bot có nhận được nút nhấn không
    console.log("Đã nhận tương tác từ:", interaction.user.tag); 

    if (!interaction.isButton()) return;
    
    if (interaction.customId === 'create_ticket') {
        // Phản hồi ngay lập tức để Discord không báo lỗi
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
            console.error("LỖI TẠO KÊNH:", error);
            await interaction.editReply({ content: `❌ Có lỗi xảy ra: ${error.message}` });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);