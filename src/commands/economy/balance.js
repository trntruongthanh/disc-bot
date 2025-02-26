const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
} = require("discord.js");

const User = require("../../models/User");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
      return;
    }

    const targetUserId =
      interaction.options.get("user")?.value || interaction.member.id;

    try {
      await interaction.deferReply();

      const query = {
        userId: targetUserId,
        guildId: interaction.guild.id,
      };

      const user = await User.findOne(query);

      if (!user) {
        interaction.editReply(`<@${targetUserId}> doesn't have a profile yet.`);
        return;
      }

      interaction.editReply(
        targetUserId === interaction.member.id
          ? `Your balance is **${user.balance}**`
          : `<@${targetUserId}>'s balance is **${user.balance}**`
      );
    } catch (error) {
      console.log(`Error with /balance: ${error}`);
    }
  },

  name: "balance",
  description: "See yours/someone else's balance",
  options: [
    {
      name: "user",
      description: "The user whose balance you want to get.",
      type: ApplicationCommandOptionType.User,
    },
  ],
};
