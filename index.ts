const TelegramApi = require('node-telegram-bot-api');
const token = "6612055476:AAE-Kvgv_FO7g_6bb5saTD9wH9uTqc4lFao";

const bot = new TelegramApi(token, { polling: true });


bot.onText(/\/start/, async (msg: any) => {
    const chatId = msg.chat.id;
    try {
        await isAdmin(msg) ? bot.sendMessage(chatId, 'Привет! Я бот. Чтобы узнать доступные команды, используйте /helpMe.'):
            bot.sendMessage(chatId, 'Привет! Для использования этого бота, пожалуйста, сделайте меня администратором в этой группе.');
    } catch(error){
        bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

bot.onText(/\/help/, (msg: any) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Доступные команды:\n/tagAll - Тегнуть всех участников\n/tagAdmins - Тегнуть админов');
});

bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'},
    {command: '/help', description: 'Нужна помощь?'},
    {command: '/tag_admins', description: 'Тегни админов'},
    {command: '/tag_all', description: 'Тегни всех участников'}
])

bot.onText(/\/tag_admins/, async (msg: any) => {
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
        // const botInfo = await bot.getChatMember(chatId, bot.botId);
        // console.log(botInfo)
        bot.sendMessage(chatId, `‼ Нефор ${user} беспокоит админов: ${adminMentions} ‼`, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, 'Не удалось получить список администраторов.');
    }
});


bot.onText(/\/tag_all/, async (msg:any) => {
    const chatId = msg.chat.id;

    try {
        const chatMembers = await bot.getChatMembersCount(chatId);
        const realUserMentions = [];
        for (let i = 0; i < chatMembers; i += 200) {
            const offset = i;
            const chatMembersChunk = await bot.getChatMember(chatId, { offset });
            const realUsers = chatMembersChunk.filter((member:any) => !member.user.is_bot);
            realUserMentions.push(...realUsers.map((user:any) => `@${user.user.username || user.user.first_name}`));
        }
        bot.sendMessage(chatId, `Тегнуть всех реальных пользователей: ${realUserMentions.join(' ')}`);
    } catch (error) {
        bot.sendMessage(chatId, 'Не удалось получить список участников чата.');
    }
});


const isAdmin = async (msg: any) =>{
    const chatId = msg.chat.id;
    const botInfo = await bot.getChatMember(chatId,6612055476)
    return  botInfo.status === 'administrator';
}















// bot.on('message', async (msg:any) => {
//     const chatId = msg.chat.id;
//     try {
//         const membersCount = await bot.getChatAdministrators(chatId);
//         // console.log(membersCount, 'Yспешно');
//     } catch (error) {
//         console.error('Ошибка при получении информации о чате:', error);
//     }
// });



// const tagCommands = {
//     '@everyone': '/tagAll',
//     '@all': '/tagAll',
//     '@admins': '/tagAdmins',
//     'Общий сбор': '/tagAll',
//     'Сбор': '/tagAll'


//

//

//

//

//
// bot.on('message', (msg: any) => {
//     const chatId = msg.chat.id;
//     const text = msg.text;
//     const lowercaseText = text.toLowerCase();
//     // Реакция на упоминания
//     if (lowercaseText.includes('@everyone') || lowercaseText.includes('@all')
//         || lowercaseText.includes('@admins') || /\bсбор\b/.test(lowercaseText)
//         // || lowercaseText.includes('Общий сбор')|| lowercaseText.includes('сбор админов')
//     ) {
//         bot.sendMessage(chatId, 'Вы упомянули всех!');
//     }
// });
//
// async function getGroupMembers(chatId: number) {
//     const response = await bot.getChatMembersCount(chatId);
//     const memberCount = response;
//     const limit = 100;
//     let offset = 0;
//     let members: any[] = [];
//     console.log(members)
//     while (offset < memberCount) {
//         const response = await bot.getChatMembers(chatId, {
//             limit: Math.min(limit, memberCount - offset),
//             offset,
//         });
//         members = members.concat(response);
//         offset += limit;
//     }
//
//     return members;
// }





