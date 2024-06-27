//copy code? pls put my github name as credit
//🖕 to those who copy without credit
const makeWASocket = require("@whiskeysockets/baileys").default
const qrcode = require("qrcode-terminal")
const fs = require('fs')
const pino = require('pino')
const { delay, useMultiFileAuthState, BufferJSON, fetchLatestBaileysVersion, PHONENUMBER_MCC, DisconnectReason, makeInMemoryStore, jidNormalizedUser, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const Pino = require("pino")
const NodeCache = require("node-cache")
const chalk = require("chalk")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")


let phoneNumber = "6285798045817"

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))


  async function qr() {
//------------------------------------------------------
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState(`./sessions`)
    const msgRetryCounterCache = new NodeCache() // for retry message, "waiting message"
    const AethersBotInc = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode, // popping up QR in terminal log
      mobile: useMobile, // mobile api (prone to bans)
      browser: ['Chrome (Linux)', '', ''], // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
     auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      browser: ['Chrome (Linux)', '', ''], // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
      markOnlineOnConnect: true, // set false for offline
      generateHighQualityLinkPreview: true, // make high preview link
      getMessage: async (key) => {
         let jid = jidNormalizedUser(key.remoteJid)
         let msg = await store.loadMessage(jid, key.id)

         return msg?.message || ""
      },
      msgRetryCounterCache, // Resolve waiting messages
      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
   })


    // login use pairing code
   // source code https://github.com/WhiskeySockets/Baileys/blob/master/Example/example.ts#L61
   if (pairingCode && !AethersBotInc.authState.creds.registered) {
      if (useMobile) throw new Error('Cannot use pairing code with mobile api')

      let phoneNumber
      if (!!phoneNumber) {
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +628xxx")))
            process.exit(0)
         }
      } else {
         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +628xxx : `)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         // Ask again when entering the wrong number
         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +628xxx")))

            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFor example: +628xxx : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            rl.close()
         }
      }

      setTimeout(async () => {
         let code = await AethersBotInc.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }
//------------------------------------------------------
    AethersBotInc.ev.on("connection.update",async  (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
            await delay(1000 * 10)
            await AethersBotInc.sendMessage(AethersBotInc.user.id, { text: `🪀Support/Contact Developer\n\n\n⎆Donate: https://telegra.ph/file/9a8dad3c76582e8abd651.jpg\n\n⎆Website: https://https://bioku.my.id/aetherscode\n\n⎆WhatsApp: https://wa.me/6285798045817\n\n⎆Telegram: https://t.me/oh_pahad\n\n⎆GitHub: https://github.com/yushafahad17/\n\n` });
            let sessionAethers = fs.readFileSync('./sessions/creds.json');
            await delay(1000 * 2) 
             const xeonses = await  AethersBotInc.sendMessage(AethersBotInc.user.id, { document: sessionAethers, mimetype: `application/json`, fileName: `creds.json` })
             await AethersBotInc.sendMessage(AethersBotInc.user.id, { text: `⚠️Do not share this file with anybody⚠️\n
┌─❖
│ Ohayo 😽
└┬❖  
┌┤✑  Thanks for using Thers-PairCode
│└────────────┈ ⳹        
│©2021-2024 AethersCode 
└─────────────────┈ ⳹\n\n ` }, {quoted: xeonses});
              await delay(1000 * 2) 
              process.exit(0)
        }
        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            qr()
        }
    })
    AethersBotInc.ev.on('creds.update', saveCreds)
    AethersBotInc.ev.on("messages.upsert",  () => { })
}
qr()

process.on('uncaughtException', function (err) {
let e = String(err)
if (e.includes("Socket connection timeout")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return
console.log('Caught exception: ', err)
})
