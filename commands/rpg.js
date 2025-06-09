module.exports = {
  name: 'rpg',
  aliases: ['rpgmenu', 'rpglist'],
  category: 'rpg',
  description: 'Menampilkan semua fitur RPG super lengkap dan seru!',
  async execute(msg, args, client) {
    const menu = `
╭━━❰ *RPG SUPER SERU* ❱━━⬣
┃ 📦 *Inventory & Progress*
┃ ┗ 🎒 .inv | 🧍 .profile | 🆙 .levelup
┃
┃ 🎣 *Aktivitas & Ekonomi*
┃ ┣ 🎣 .mancing | ⛏️ .mining | 🌲 .tebang
┃ ┣ 🗡️ .berburu | 🧱 .craft | 🪙 .kerja
┃ ┣ 🌾 .bertani | 💤 .tidur | 🧘‍♂️ .kesehatan
┃ ┗ 💬 .mood | 🍲 .masak | 🧾 .resep
┃
┃ 🐾 *Pet & Dungeon*
┃ ┣ 🐶 .pet | 🍖 .feedpet | 🔁 .evolusi
┃ ┣ 🏰 .dungeon | 👹 .boss | 💥 .attack
┃ ┗ 🧪 .buff | 🛡️ .equip | 🎯 .skill
┃
┃ 💼 *Ekonomi Lanjut*
┃ ┣ 🏠 .properti | 🛻 .kendaraan
┃ ┣ 🧰 .bengkel | 🛢️ .isioli | ⚙️ .service
┃ ┗ 💳 .pinjam-mafia | 💂 .pajak
┃
┃ 📱 *Gadget & Digital*
┃ ┣ 📱 .hp | 🖥️ .pc | 🔧 .upgradepc
┃ ┣ 💸 .crypto | 📈 .saham
┃ ┗ ⚙️ .automin | ⚡ .autocrypto
┃
┃ 🏅 *Prestasi & Sosial*
┃ ┣ 🏆 .ranking | 🏅 .badge | 🎖️ .achievement
┃ ┣ 🗳️ .voting | 🧠 .hacking | 💀 .reinkarnasi
┃ ┗ 🧿 .paralel | 👥 .npc | 🎭 .story
╰━━━━━━━━━━━━━━━━━━⬣
*Gunakan perintah di atas untuk mulai petualanganmu!*
`.trim();

    msg.reply(menu);
  }
};
