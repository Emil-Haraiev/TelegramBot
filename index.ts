const TelegramApi = require('node-telegram-bot-api');
require('dotenv').config();
const token = "6612055476:AAE-Kvgv_FO7g_6bb5saTD9wH9uTqc4lFao";

const bot = new TelegramApi(token, { polling: true });


bot.onText(/\/start/, async (msg: any) => {
    const chatId = msg.chat.id;
    try {
        await isAdmin(msg) ? bot.sendMessage(chatId, 'Привет! Я бот. Чтобы узнать доступные команды, используйте /help.'):
            bot.sendMessage(chatId, 'Привет! Для использования этого бота, пожалуйста, сделайте меня администратором в этой группе. Если вы уже предоставили администратора используйте /check для проверки');
    } catch(error){
        bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

bot.onText(/\/help/, (msg: any) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Доступные команды:\n/tag_all - Тегнуть всех участников\n/tag_admins - Тегнуть админов');
});

bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'},
    {command: '/help', description: 'Нужна помощь?'},
    {command: '/tag_admins', description: 'Тегни админов'},
    {command: '/tag_all', description: 'Тегни всех участников'}
])


bot.onText(/\/check/,  async (msg: any) => {
    const chatId = msg.chat.id;

    try{
        await isAdmin(msg) ?  bot.sendMessage(chatId, 'Спасибо! Теперь вы можете использовать команды. Для просмотра доступных команд введите /help.'):
            bot.sendMessage(chatId, 'Вы пока не дали мне статус администратора. Для продолжения работы, пожалуйста, сделайте меня администратором в чате, затем выполните команду /check.' )
    } catch (error){
        bot.senMessage(chatId, 'Упс... Что-то пошло не так. Пожалуйста, попробуйте еще раз позже.')
    }

});


bot.onText(/(\/tag_admins|^(Сбор админов)$)/i, async (msg: any) => {
    const chatId = msg.chat.id;
    const user = msg.from.first_name;
    try {
        const members = await bot.getChatAdministrators(chatId);
        const adminMentions = members
            .filter((admin: any) => !admin.user.is_bot)
            .map((admin: any) => {
                // return `@${admin.user.username}`;
                const userLink = `tg://user?id=${admin.user.id}`;
                return `[${admin.user.first_name}](${userLink}),`;
            })
            .join(' ');
        bot.sendMessage(chatId, `‼ Пользователь ${user} вызывает администраторов: ${adminMentions} ‼`, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, 'Не удалось получить список администраторов.');
    }
});


// bot.onText(/(\/tag_all | |^(Сбор админов)$)/i, async (msg:any) => {
//     const chatId = msg.chat.id;
//
//     try {
//         const chatMembers = await bot.getChatMembersCount(chatId);
//         const realUserMentions: string[] = [];
//         for (let i = 0; i < chatMembers; i += 200) {
//             const offset = i;
//             const chatMembersChunk = await bot.getChatMember(chatId, { offset });
//             console.log(chatMembersChunk)
//             // const realUsers = chatMembersChunk.filter((member:any) => !member.user.is_bot);
//             // realUserMentions.push(...realUsers.map((user:any) => `@${user.user.username || user.user.first_name}`));
//         }
//         bot.sendMessage(chatId, `Тегнуть всех реальных пользователей: ${realUserMentions.join(' ')}`);
//     } catch (error) {
//         bot.sendMessage(chatId, 'Не удалось получить список участников чата.');
//     }
// });


const isAdmin = async (msg: any) =>{
    const chatId = msg.chat.id;
    const botInfo = await bot.getChatMember(chatId,6612055476)
    return  botInfo.status === 'administrator';
}



bot.onText(/(\/pin|^(пин)$)/i, (msg: any) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    bot.pinChatMessage(chatId, messageId)
        .then(() => {
            bot.sendMessage(chatId, 'Сообщение успешно закреплено с уведомлением.');
        })
        .catch((error: any) => {
            bot.sendMessage(chatId, 'Не удалось закрепить сообщение. Пожалуйста, попробуйте позже.');
        });
});










