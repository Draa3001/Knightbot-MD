require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const readline = require("readline")
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const { 
    default: makeWASocket,
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function startBot() {
    const { version, isLatest } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

    const sock = makeWASocket({
        version,
        logger: require('pino')({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, require('pino')().child({ level: 'silent' })),
        },
        markOnlineOnConnect: true,
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => ({ message: "" })
    })

    if (!sock.authState.creds.registered) {
        const input = await question(chalk.green("Masukkan nomor WhatsApp kamu (cth: 6281234567890): "))
        let phoneNumber = input.replace(/[^0-9]/g, '')
        if (!phoneNumber.startsWith('62') && !phoneNumber.startsWith('91')) {
            phoneNumber = '62' + phoneNumber
        }

        console.log(chalk.yellow("Meminta pairing code..."))
        try {
            let code = await sock.requestPairingCode(phoneNumber)
            code = code?.match(/.{1,4}/g)?.join("-") || code
            console.log(chalk.black(chalk.bgGreen("\nKode Pairing Kamu:")), chalk.white(code))
            console.log(chalk.yellow(`\nCara menghubungkan:\n1. Buka WhatsApp\n2. Pengaturan > Perangkat Tertaut\n3. Tautkan Perangkat\n4. Masukkan kode di atas.`))
        } catch (err) {
            console.error(chalk.red("Gagal mendapatkan pairing code:"), err)
        }
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'open') {
            console.log(chalk.green('✅ Berhasil terhubung ke WhatsApp!'))
        } else if (connection === 'close') {
            console.log(chalk.red('❌ Koneksi ditutup. Mengulang...'))
            if (lastDisconnect?.error?.output?.statusCode !== 401) {
                startBot()
            }
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

startBot().catch(err => console.error('❌ Error:', err))