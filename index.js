const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  makeInMemoryStore
} = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const figlet = require('figlet')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

const store = makeInMemoryStore({ logger: console })
store.readFromFile('./store.json')
setInterval(() => {
  store.writeToFile('./store.json')
}, 10000)

console.log(chalk.cyan(figlet.textSync('Nixx MD', { horizontalLayout: 'full' })))
console.log(chalk.green('WhatsApp RPG Bot by Skyzo\n'))

// Load all commands
const commands = new Map()
const commandPath = path.join(__dirname, 'commands')
fs.readdirSync(commandPath).forEach(file => {
  if (file.endsWith('.js')) {
    const cmd = require(path.join(commandPath, file))
    commands.set(cmd.name, cmd)
    if (cmd.aliases && Array.isArray(cmd.aliases)) {
      cmd.aliases.forEach(alias => commands.set(alias, cmd))
    }
  }
})

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, console)
    },
    printQRInTerminal: false,
    browser: ['Nixx MD', 'Chrome', '1.0.0']
  })

  store.bind(sock.ev)

  // Pairing code login (nomor kamu udah diisi otomatis)
  if (!sock.authState.creds.registered) {
    const phoneNumber = '6287831823978@s.whatsapp.net'
    let code = await sock.requestPairingCode(phoneNumber)
    console.log(chalk.yellow(`\n💬 Pairing code untuk ${phoneNumber}: ${chalk.cyan(code)}`))
  }

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    if (!text.startsWith('.')) return

    const [cmdName, ...args] = text.slice(1).trim().split(/\s+/)
    const command = commands.get(cmdName.toLowerCase())

    if (command) {
      try {
        await command.execute(msg, args, sock)
      } catch (err) {
        console.error('[ERROR COMMAND]', err)
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Terjadi error saat menjalankan command!' })
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔄 Koneksi terputus. Menghubungkan ulang...'))
        startBot()
      } else {
        console.log(chalk.red('❌ Akun logout. Hapus folder session dan login ulang.'))
      }
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ Bot berhasil terhubung ke WhatsApp!'))
    }
  })
}

startBot()