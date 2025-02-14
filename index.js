require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
    console.log(`${client.user.tag} đã sẵn sàng!`);
});

client.on("messageCreate", async (message) => {
    if (message.content.startsWith("!addorder")) {
        message.delete(); // Xóa lệnh ngay sau khi gửi

        const args = message.mentions.users.first(); // Lấy người mua
        const id = message.content.split(" ")[2] || "Không xác định"; // ID đơn hàng
        const ticket = message.mentions.channels.first(); // Kênh hỗ trợ

        if (!args || !id || !ticket) {
            return message.channel.send("⚠️ Sai cú pháp! Hãy dùng: `!addorder @nguoimua sv_000 #ticket`").then(msg => {
                setTimeout(() => msg.delete(), 5000); // Xóa thông báo sau 5 giây
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("📌 Đơn hàng mới")
            .setColor("Yellow")
            .setDescription("Thông tin đơn hàng")
            .addFields(
                { name: "👤 Người mua", value: `${args}`, inline: true },
                { name: "🆔 ID Đơn", value: id, inline: true },
                { name: "📌 Ticket", value: `${ticket}`, inline: true },
                { name: "📌 Trạng thái", value: "⏳ Đang chờ xử lý", inline: true }
            )
            .setFooter({ text: "© Arnto Shop", iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`done_${id}`)
                    .setLabel("✅ Done")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`cancel_${id}`)
                    .setLabel("❌ Cancel")
                    .setStyle(ButtonStyle.Danger)
            );

        message.channel.send({ embeds: [embed], components: [buttons] });
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const [action, orderId] = interaction.customId.split("_");

    // Chỉ người có ID 919367005784641577 mới bấm được nút
    if (interaction.user.id !== "919367005784641577") {
        return interaction.reply({ content: "🚫 Bạn không có quyền thao tác trên đơn hàng này!", ephemeral: true });
    }

    const message = interaction.message;
    const oldEmbed = message.embeds[0];

    let newColor, newStatus;
    if (action === "done") {
        newColor = "Green";
        newStatus = "✅ Đã xong";
    } else if (action === "cancel") {
        newColor = "Red";
        newStatus = "❌ Đã hủy";
    }

    const updatedEmbed = EmbedBuilder.from(oldEmbed)
        .setColor(newColor)
        .spliceFields(3, 1, { name: "📌 Trạng thái", value: newStatus, inline: true });

    await interaction.update({ embeds: [updatedEmbed], components: [] });
});

client.login(process.env.TOKEN);
