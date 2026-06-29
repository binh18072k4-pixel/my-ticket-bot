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

// Lệnh !setup để gửi khung tin nhắn
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

// XỬ LÝ NÚT BẤM (Đã tối ưu để không bị lỗi timeout)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'create_ticket') {
        
        // 1. Phản hồi "ngầm" cho Discord biết là bot đã nhận lệnh
        await interaction.deferReply({ ephemeral: true });

        try {
            // 2. Tạo kênh mới
            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                ],
            });

            // 3. Cập nhật kết quả vào tin nhắn ẩn đã defer
            await interaction.editReply({ 
                content: `✅ Đã tạo ticket thành công tại: ${channel}` 
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: '❌ Có lỗi xảy ra, hãy kiểm tra quyền của bot!' 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);