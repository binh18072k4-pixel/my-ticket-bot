require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.once('ready', () => {
    console.log(`Bot đã sẵn sàng! Đăng nhập với tư cách: ${client.user.tag}`);
});

// Lệnh: Gửi bảng đặt lịch (Chỉ cần gõ !setup-ticket một lần duy nhất)
client.on('messageCreate', async (message) => {
    if (message.content === '!setup-ticket') {
        const embed = new EmbedBuilder()
            .setTitle('📅 Đặt Lịch Dịch Vụ')
            .setDescription('Nhấn nút bên dưới để bắt đầu đặt lịch trò chuyện hoặc chơi game.')
            .setColor(0x00FF00);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('Đặt Lịch Ngay')
                .setStyle(ButtonStyle.Success)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// Xử lý sự kiện bấm nút và điền Form
client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'open_ticket') {
        const modal = new ModalBuilder().setCustomId('ticket_modal').setTitle('Thông tin đặt lịch');

        const serviceInput = new TextInputBuilder()
            .setCustomId('service').setLabel('Bạn muốn đặt dịch vụ gì?').setStyle(TextInputStyle.Short);
        
        const timeInput = new TextInputBuilder()
            .setCustomId('time').setLabel('Thời gian dự kiến?').setStyle(TextInputStyle.Short);

        modal.addComponents(
            new ActionRowBuilder().addComponents(serviceInput),
            new ActionRowBuilder().addComponents(timeInput)
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'ticket_modal') {
        const service = interaction.fields.getTextInputValue('service');
        const time = interaction.fields.getTextInputValue('time');

        // Tạo kênh riêng tư
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ],
        });

        await interaction.reply({ content: `✅ Đã tạo kênh riêng cho bạn: ${channel}`, ephemeral: true });
        await channel.send(`📩 **Yêu cầu mới từ:** ${interaction.user}\n**Dịch vụ:** ${service}\n**Thời gian:** ${time}\n\n*Nhân viên sẽ hỗ trợ bạn sớm nhất!*`);
    }
});

client.login(process.env.DISCORD_TOKEN);