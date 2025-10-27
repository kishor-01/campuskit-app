// /src/lib/discordNotifier.ts

// This is the structure for a Discord Embed message
type DiscordEmbed = {
  title: string;
  description: string;
  url: string;
  color: number; // A decimal color code
  author?: {
    name: string;
  };
};

export async function sendDiscordNotification(
  webhookUrl: string | undefined, 
  embed: DiscordEmbed
) {
  if (!webhookUrl) {
    console.log("Discord webhook URL not found, skipping notification.");
    return;
  }

  const payload = {
    // You can add a username and avatar_url here to customize the bot's appearance
    // username: "EduLink Bot",
    // avatar_url: "your_bot_avatar_url",
    embeds: [embed],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error sending Discord notification: ${response.statusText}`, errorText);
    }
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
  }
}