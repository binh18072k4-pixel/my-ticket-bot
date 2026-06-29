const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

client.once('ready', () => {
    console.log(`Bot đã sẵn sàng! Đăng nhập với tư cách: ${client.user.tag}`);
});

// Lệnh ví dụ để gửi khung Ticket (Bạn có thể gõ !setup để bot gửi)
client.on('messageCreate', async (message) => {
    if (message.content === '!setup') {
        
        // 1. Tạo khung Embed sang trọng
        const ticketEmbed = new EmbedBuilder()
            .setColor('#2ecc71') // Màu xanh lá cho nút "Success"
            .setTitle('📅 Đặt Lịch Dịch Vụ')
            .setDescription('Chào bạn! Hệ thống đặt lịch đã sẵn sàng.\n\nNhấn vào nút **Đặt Lịch Ngay** bên dưới để mở yêu cầu trò chuyện hoặc chơi game. Chúng mình sẽ phản hồi bạn sớm nhất có thể!')
            .addFields(
                { name: '⏰ Thời gian phản hồi', value: 'Trong vòng 15-30 phút', inline: true },
                { name: '🎮 Dịch vụ', value: 'Trò chuyện / Chơi game', inline: true }
            )
            .setTimestamp() // Hiện thời gian gửi
            .setFooter({ text: 'Hệ thống tự động bởi Ticket Tool', iconURL: client.user.displayAvatarURL() });

        // 2. Tạo nút bấm sinh động
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Đặt Lịch Ngay')
                    .setStyle(ButtonStyle.Success) // Màu xanh lá
                    .setEmoji('🎫') // Thêm icon vé
            );

        // 3. Gửi tin nhắn vào kênh
        await message.channel.send({ embeds: [ticketEmbed], components: [row] });
    }
});

// Xử lý khi nhấn vào nút
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'create_ticket') {
        await interaction.reply({ content: '✅ Đã nhận yêu cầu! Đang tạo ticket cho bạn...', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);