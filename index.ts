const TelegramApi = require('node-telegram-bot-api');
require('dotenv').config();
const token = process.env.BOT_TOKEN;
const bot = new TelegramApi(token, { polling: true });

bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'},
    {command: '/help', description: 'Нужна помощь?'},
    {command: '/tag_admins', description: 'Тегни админов'},
    {command: '/tag_all', description: 'Тегни всех участников'},
    {command: '/pin', description: 'Закрепи сообщение с уведомлением'}
])

enum ChatMemberStatus {
    ADMIN = 'administrator',
    CREATOR = 'creator',
    MEMBER = 'member'
}

const isAdmin = async (msg: any) =>{
    const chatId = msg.chat.id;
    const botInfo = await bot.getChatMember(chatId,6612055476)
    return  botInfo.status === ChatMemberStatus.ADMIN;
}

bot.onText(/\/start/, async (msg: any) => {
    const chatId = msg.chat.id;
    try {
        await isAdmin(msg) ? bot.sendMessage(chatId, 'Привет! Я бот. Чтобы узнать доступные команды, используйте /help.'):
            bot.sendMessage(chatId,
                'Привет! Для использования этого бота, пожалуйста, сделайте меня администратором в этой группе.' +
                ' Если вы уже предоставили администратора используйте /check для проверки');
    } catch(error){
        bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

bot.onText(/\/help/, (msg: any) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Доступные команды:\n/tag_all- Тегнуть всех участников (сбор)\n/tag_admins - Тегнуть админов (сбор админов)' +
        '\n/pin - Закрепить сообщение (пин, закреп)');
});

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
        let adminMentions = members
            .filter((admin: any) => !admin.user.is_bot)
            .map((admin: any) => {
                if(admin.user.username) {
                    return `@${admin.user.username},`;
                }
                    // }else{
                //     const userLink = `tg://user?id=${admin.user.id}`;
                //     return `[${admin.user.first_name}](${userLink}),`;
                // }


            })
            .join(' ');

        adminMentions = adminMentions.slice(0, -1);
        // const parseMode = adminMentions.includes('@') ? undefined : 'Markdown';

        bot.sendMessage(chatId, `‼ Пользователь ${user} вызывает администраторов: ${adminMentions} ‼`, {parseMode: 'Markdown'});
    } catch (error) {
        bot.sendMessage(chatId, 'Не удалось получить список администраторов.');
    }
});

bot.onText(/(\/pin|^(пин)|^(закреп))$/i, async (msg: any) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const replyToMessage = msg.reply_to_message;

    if (!replyToMessage) {
        bot.sendMessage(chatId, 'Пожалуйста, ответьте на сообщение, которое вы хотите закрепить.');
        return;
    }

    try {
        const chatMember = await bot.getChatMember(chatId, userId);
        if (chatMember.status === ChatMemberStatus.ADMIN || chatMember.status === ChatMemberStatus.CREATOR) {
            bot.pinChatMessage(chatId, replyToMessage.message_id)
                .then(() => {
                    bot.sendMessage(chatId, 'Сообщение успешно закреплено с уведомлением.');
                })
                .catch((error: any) => {
                    bot.sendMessage(chatId, 'Не удалось закрепить сообщение. Пожалуйста, попробуйте позже.');
                });
        } else {
            bot.sendMessage(chatId, 'У вас нет прав на закрепление сообщений в этом чате.');
        }
    } catch (error) {
        bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});



bot.onText(/(\/tag_all|^(Тегнуть всех)$)/i, async (msg: any) => {
    const chatId = msg.chat.id;
    const user = msg.from.first_name;
    try {
        const chatMembersCount = await bot.getChatMemberCount(chatId);
        console.log(chatMembersCount)
        const userMentions: any = [];
        for (let i = 0; i < chatMembersCount; i++) {
            const chatMember =  bot.getChatMember(chatId, i);
            console.log(chatMember)
            if (!chatMember.user.is_bot) {
                const mention = `@${chatMember.user.username}`;
                userMentions.push(mention);
            }
            console.log(userMentions)
        }

        // Присоединяем участников через запятую и отправляем сообщение
        bot.sendMessage(chatId, `‼ Пользователь ${user} тегнул всех участников: ${userMentions.join(', ')} ‼`, { parseMode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, 'Не удалось получить список участников чата.');
    }
});

