import logging
import random
from telegram import (
    ReplyKeyboardMarkup,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Update,
)
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
    CallbackQueryHandler,
    JobQueue,
)
from datetime import datetime, timedelta
from collections import defaultdict

# Настройка логгирования
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Данные пользователя (временное хранилище)
user_data = defaultdict(lambda: {
    "ice_cream_count": 0,
    "history": [],
    "dates": defaultdict(int),
    "flavors": defaultdict(int),
    "collection": defaultdict(int),
    "last_drop": None
})

# Клавиатура основного меню
main_keyboard = ReplyKeyboardMarkup(
    [
        ["👤 Профиль", "🌐 Соцсети"],
        ["📂 Проекты", "🍦 Счетчик мороженого"],
        ["📋 Команды", "🎁 Коллекция"]
    ],
    resize_keyboard=True,
    input_field_placeholder="Выберите действие..."
)

# Все возможные вкусы мороженого
FLAVORS = {
    "chocolate": {"emoji": "🍫", "color": "🟤", "rarity": "common"},
    "vanilla": {"emoji": "⚪", "color": "🟡", "rarity": "common"},
    "strawberry": {"emoji": "🍓", "color": "🔴", "rarity": "common"},
    "mint": {"emoji": "🟢", "color": "🟢", "rarity": "uncommon"},
    "caramel": {"emoji": "🟤", "color": "🟠", "rarity": "uncommon"},
    "blueberry": {"emoji": "🔵", "color": "🔵", "rarity": "uncommon"},
    "matcha": {"emoji": "🍵", "color": "🟢", "rarity": "rare"},
    "unicorn": {"emoji": "🦄", "color": "🌈", "rarity": "rare"},
    "gold": {"emoji": "🌟", "color": "🌟", "rarity": "legendary"},
    "dragon": {"emoji": "🐉", "color": "🔴", "rarity": "legendary"}
}

RARITY_WEIGHTS = {
    "common": 50,
    "uncommon": 30,
    "rare": 15,
    "legendary": 5
}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработка команды /start."""
    user = update.message.from_user
    await update.message.reply_text(
        f"🌟 Привет, {user.first_name}!\n"
        "Я - бот-портфолио с коллекцией мороженого!\n"
        "Каждые 3 часа ты можешь получить случайный вкус мороженого.\n"
        "Попробуй собрать их все!",
        reply_markup=main_keyboard
    )
    
    # Проверяем, можно ли выдать мороженое
    await check_ice_cream_drop(update, context)

async def check_ice_cream_drop(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Проверяет, можно ли выдать мороженое пользователю."""
    user_id = update.effective_user.id
    now = datetime.now()
    
    if user_data[user_id]["last_drop"] is None:
        # Первый раз - выдаем сразу
        await drop_random_flavor(update, context)
    else:
        last_drop = user_data[user_id]["last_drop"]
        if (now - last_drop) >= timedelta(hours=3):
            await drop_random_flavor(update, context)
        else:
            next_drop = last_drop + timedelta(hours=3)
            wait_time = next_drop - now
            hours = wait_time.seconds // 3600
            minutes = (wait_time.seconds % 3600) // 60
            await update.message.reply_text(
                f"⏳ Следующее мороженое можно будет получить через {hours}ч {minutes}мин\n"
                f"⌛ Последнее было: {last_drop.strftime('%H:%M %d.%m.%Y')}"
            )

async def drop_random_flavor(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Выдает случайный вкус мороженого."""
    user_id = update.effective_user.id
    
    # Выбираем случайный вкус с учетом редкости
    flavors_by_rarity = {}
    for flavor, data in FLAVORS.items():
        if data["rarity"] not in flavors_by_rarity:
            flavors_by_rarity[data["rarity"]] = []
        flavors_by_rarity[data["rarity"]].append(flavor)
    
    # Взвешенный случайный выбор редкости
    chosen_rarity = random.choices(
        list(RARITY_WEIGHTS.keys()),
        weights=list(RARITY_WEIGHTS.values()),
        k=1
    )[0]
    
    # Выбираем случайный вкус выбранной редкости
    chosen_flavor = random.choice(flavors_by_rarity[chosen_rarity])
    flavor_data = FLAVORS[chosen_flavor]
    
    # Обновляем данные пользователя
    user_data[user_id]["collection"][chosen_flavor] += 1
    user_data[user_id]["last_drop"] = datetime.now()
    
    # Определяем сообщение в зависимости от редкости
    rarity_messages = {
        "common": "Неплохо!",
        "uncommon": "Хороший улов!",
        "rare": "Великолепно!",
        "legendary": "Невероятно!!!"
    }
    
    # Отправляем сообщение
    await update.message.reply_text(
        f"🎉 {rarity_messages[chosen_rarity]} Ты получил:\n"
        f"{flavor_data['emoji']} <b>{chosen_flavor.capitalize()}</b> мороженое!\n"
        f"Редкость: {chosen_rarity.capitalize()}\n\n"
        f"Теперь у тебя {user_data[user_id]['collection'][chosen_flavor]} шт. этого вкуса",
        parse_mode="HTML"
    )

async def show_collection(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Показывает коллекцию мороженого пользователя."""
    user_id = update.effective_user.id
    collection = user_data[user_id]["collection"]
    
    if not collection:
        await update.message.reply_text(
            "❌ Твоя коллекция пуста!\n"
            "Попробуй получить первое мороженое через команду /ice_cream",
            reply_markup=main_keyboard
        )
        return
    
    # Группируем по редкости
    flavors_by_rarity = {}
    for flavor, count in collection.items():
        rarity = FLAVORS[flavor]["rarity"]
        if rarity not in flavors_by_rarity:
            flavors_by_rarity[rarity] = []
        flavors_by_rarity[rarity].append((flavor, count))
    
    # Сортируем по редкости (от легендарных к обычным)
    sorted_rarities = sorted(flavors_by_rarity.items(), 
                           key=lambda x: list(RARITY_WEIGHTS.keys()).index(x[0]))
    
    # Формируем сообщение
    message = ["<b>🍨 Твоя коллекция мороженого:</b>\n"]
    
    for rarity, flavors in sorted_rarities:
        message.append(f"\n<b>{rarity.capitalize()}:</b>")
        for flavor, count in sorted(flavors):
            emoji = FLAVORS[flavor]["emoji"]
            message.append(f"{emoji} {flavor.capitalize()}: {count} шт.")
    
    # Статистика
    total_flavors = sum(collection.values())
    unique_flavors = len(collection)
    percentage = (unique_flavors / len(FLAVORS)) * 100
    
    message.append(f"\n\n<b>📊 Статистика:</b>")
    message.append(f"Всего мороженого: {total_flavors}")
    message.append(f"Уникальных вкусов: {unique_flavors} из {len(FLAVORS)} ({percentage:.1f}%)")
    
    # Прогресс бар коллекции
    progress = int((unique_flavors / len(FLAVORS)) * 20)
    message.append("\n" + "🟩" * progress + "⬜" * (20 - progress))
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🔄 Проверить дроп", callback_data="check_drop")],
        [InlineKeyboardButton("🍦 Добавить в статистику", callback_data="add_to_stats")]
    ])
    
    await update.message.reply_text(
        "\n".join(message),
        reply_markup=keyboard,
        parse_mode="HTML"
    )

async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Красиво оформленный профиль со статистикой мороженого."""
    user_id = update.effective_user.id
    total_ice_cream = user_data[user_id]["ice_cream_count"]
    unique_flavors = len(user_data[user_id]["collection"])
    
    # Генерация графика мороженого
    ice_cream_chart = generate_ice_cream_chart(user_data[user_id])
    
    profile_text = f"""
<b>👤 Персональная информация:</b>

<u>Основные данные:</u>
• Имя: Алексей Петров
• Возраст: 28 лет
• Локация: Москва, Россия
• Должность: Full-stack разработчик

<u>Навыки:</u>
🐍 Python (Django, Flask, FastAPI)
🌐 JavaScript (React, Node.js)
📱 Мобильная разработка (Kivy)
🤖 Чат-боты (Telegram, Discord)
☁️ Облачные технологии (AWS, Docker)

<u>Статистика мороженого:</u>
🍦 Всего съедено: <b>{total_ice_cream}</b> порций
🎨 Уникальных вкусов: <b>{unique_flavors}</b> из {len(FLAVORS)}
{ice_cream_chart}

<u>Образование:</u>
🎓 МГТУ им. Баумана
📅 2013-2019
💻 Компьютерные науки

<u>Опыт работы:</u>
• Senior Developer в Яндекс (2020-н.в.)
• Middle Developer в Mail.ru (2018-2020)
• Junior Developer в СберТех (2016-2018)
"""

    photo_url = "https://via.placeholder.com/400x300?text=Developer+Photo"
    
    try:
        await update.message.reply_photo(
            photo=photo_url,
            caption=profile_text,
            parse_mode="HTML"
        )
    except:
        await update.message.reply_text(
            profile_text,
            parse_mode="HTML"
        )

def generate_ice_cream_chart(user_data):
    """Генерация графика потребления мороженого."""
    if not user_data["flavors"]:
        return "📊 Еще нет данных о вкусах"
    
    total = sum(user_data["flavors"].values())
    chart = []
    
    # Сортируем по количеству
    sorted_flavors = sorted(user_data["flavors"].items(), key=lambda x: x[1], reverse=True)
    
    for flavor, count in sorted_flavors[:5]:  # Показываем топ-5
        emoji = FLAVORS.get(flavor, {}).get("emoji", "🍦")
        percentage = (count / total) * 100
        bar = "⬛" * int(percentage / 10)
        chart.append(f"{emoji} {flavor.capitalize():<10} {bar} {count:>3} ({percentage:.1f}%)")
    
    return "\n".join(chart)

async def social_media(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Социальные сети."""
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("📂 GitHub", url="https://github.com")],
        [InlineKeyboardButton("💼 LinkedIn", url="https://linkedin.com")],
        [InlineKeyboardButton("📱 Telegram", url="https://t.me")],
        [InlineKeyboardButton("🐦 Twitter", url="https://twitter.com")],
    ])
    await update.message.reply_text(
        "🔗 Мои социальные сети:",
        reply_markup=keyboard
    )

async def projects(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Проекты с ссылками на GitHub."""
    projects_text = """
<b>📂 Мои проекты:</b>

1. <b>Telegram Бот для учета финансов</b>
   - Python, aiogram, PostgreSQL
   - 🔗 <a href="https://github.com/example/finance-bot">GitHub</a>

2. <b>Веб-приложение для трекинга задач</b>
   - Django, React, Docker
   - 🔗 <a href="https://github.com/example/task-manager">GitHub</a>

3. <b>Мобильное приложение для изучения языков</b>
   - Kivy, Python, SQLite
   - 🔗 <a href="https://github.com/example/language-app">GitHub</a>

4. <b>API для сервиса доставки еды</b>
   - FastAPI, MongoDB, Redis
   - 🔗 <a href="https://github.com/example/delivery-api">GitHub</a>
"""
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("⭐ Все проекты на GitHub", url="https://github.com")],
    ])
    
    await update.message.reply_text(
        projects_text,
        reply_markup=keyboard,
        parse_mode="HTML",
        disable_web_page_preview=True
    )

async def ice_cream_counter(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Счетчик мороженого с красивой таблицей."""
    user_id = update.effective_user.id
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Инициализация данных
    if today not in user_data[user_id]["dates"]:
        user_data[user_id]["dates"][today] = 0
    
    stats_text = generate_ice_cream_stats(user_data[user_id])
    
    keyboard = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🍫 Шоколад", callback_data="flavor_chocolate"),
            InlineKeyboardButton("⚪ Ваниль", callback_data="flavor_vanilla"),
        ],
        [
            InlineKeyboardButton("🍓 Клубника", callback_data="flavor_strawberry"),
            InlineKeyboardButton("🟢 Мята", callback_data="flavor_mint"),
        ],
        [
            InlineKeyboardButton("🟤 Карамель", callback_data="flavor_caramel"),
            InlineKeyboardButton("🔵 Голубика", callback_data="flavor_blueberry"),
        ],
        [InlineKeyboardButton("📊 Подробная статистика", callback_data="show_stats")],
        [InlineKeyboardButton("🔄 Сбросить счетчик", callback_data="reset_counter")],
    ])
    
    await update.message.reply_text(
        f"🍦 Счетчик мороженого\n\n{stats_text}",
        reply_markup=keyboard,
        parse_mode="HTML"
    )

def generate_ice_cream_stats(user_data):
    """Генерация красивой таблицы статистики."""
    today = datetime.now().strftime("%Y-%m-%d")
    total = user_data["ice_cream_count"]
    today_count = user_data["dates"].get(today, 0)
    week_count = sum(user_data["dates"].get((datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), 0) 
                for i in range(7))
    
    # Красивая таблица с псевдографикой
    table = [
        "<b>📊 Статистика потребления мороженого</b>",
        "",
        "┏━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━┓",
        f"┃ {'Показатель':<18} ┃ {'Значение':>7} ┃",
        "┣━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━┫",
        f"┃ {'Сегодня':<18} ┃ {today_count:>7} ┃",
        f"┃ {'За неделю':<18} ┃ {week_count:>7} ┃",
        f"┃ {'Всего':<18} ┃ {total:>7} ┃",
        "┗━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━┛",
        "",
        "<b>🍨 Популярные вкусы:</b>"
    ]
    
    # Топ-3 вкуса
    if user_data["flavors"]:
        top_flavors = sorted(user_data["flavors"].items(), key=lambda x: x[1], reverse=True)[:3]
        for i, (flavor, count) in enumerate(top_flavors, 1):
            emoji = FLAVORS.get(flavor, {}).get("emoji", "🍦")
            table.append(f"{i}. {emoji} {flavor.capitalize()}: {count} порций")
    else:
        table.append("Еще нет данных о вкусах")
    
    return "\n".join(table)

def generate_detailed_stats(user_data):
    """Генерация детальной статистики."""
    today = datetime.now().strftime("%Y-%m-%d")
    total = user_data["ice_cream_count"]
    today_count = user_data["dates"].get(today, 0)
    
    # Статистика по дням
    days_stats = []
    for i in range(7):
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        count = user_data["dates"].get(date, 0)
        days_stats.append((date, count))
    
    # Статистика по вкусам
    flavors_stats = sorted(user_data["flavors"].items(), key=lambda x: x[1], reverse=True)
    
    # Формируем сообщение
    message = [
        "<b>🍦 Детальная статистика</b>",
        "",
        "<b>📅 По дням:</b>",
        "┏━━━━━━━━━━━━━━┳━━━━━━━━━┓",
        "┃ Дата         ┃ Порций  ┃",
        "┣━━━━━━━━━━━━━━╋━━━━━━━━━┫"
    ]
    
    for date, count in sorted(days_stats, reverse=True):
        message.append(f"┃ {date} ┃ {count:>7} ┃")
    
    message.extend([
        "┗━━━━━━━━━━━━━━┻━━━━━━━━━┛",
        "",
        "<b>🍨 По вкусам:</b>",
        "┏━━━━━━━━━━━━━━┳━━━━━━━━━┓",
        "┃ Вкус         ┃ Порций  ┃",
        "┣━━━━━━━━━━━━━━╋━━━━━━━━━┫"
    ])
    
    for flavor, count in flavors_stats:
        emoji = FLAVORS.get(flavor, {}).get("emoji", "🍦")
        message.append(f"┃ {emoji} {flavor.capitalize():<8} ┃ {count:>7} ┃")
    
    message.append("┗━━━━━━━━━━━━━━┻━━━━━━━━━┛")
    
    return "\n".join(message)

async def button_click(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработка нажатий на inline-кнопки."""
    query = update.callback_query
    user_id = query.from_user.id
    data = query.data
    today = datetime.now().strftime("%Y-%m-%d")

    # Инициализация данных
    if today not in user_data[user_id]["dates"]:
        user_data[user_id]["dates"][today] = 0

    if data.startswith("flavor_"):
        flavor = data.split("_")[1]
        emoji = FLAVORS.get(flavor, {}).get("emoji", "🍦")
        
        # Обновляем счетчики
        user_data[user_id]["ice_cream_count"] += 1
        user_data[user_id]["dates"][today] += 1
        user_data[user_id]["flavors"][flavor] += 1
        user_data[user_id]["history"].append({
            "date": datetime.now().strftime("%d.%m.%Y %H:%M"),
            "count": 1,
            "flavor": flavor
        })
        
        await query.answer(f"{emoji} +1 {flavor} мороженое! Сегодня: {user_data[user_id]['dates'][today]}")
    
    elif data == "show_stats":
        detailed_stats = generate_detailed_stats(user_data[user_id])
        await query.answer()
        await query.edit_message_text(
            text=f"🍦 Детальная статистика\n\n{detailed_stats}",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("🔙 Назад", callback_data="back_to_main")],
            ]),
            parse_mode="HTML"
        )
        return
    
    elif data == "reset_counter":
        user_data[user_id]["ice_cream_count"] = 0
        user_data[user_id]["history"] = []
        user_data[user_id]["dates"] = defaultdict(int)
        user_data[user_id]["flavors"] = defaultdict(int)
        user_data[user_id]["dates"][today] = 0
        await query.answer("Счетчик сброшен!")
    
    elif data == "back_to_main":
        stats_text = generate_ice_cream_stats(user_data[user_id])
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("🍫 Шоколад", callback_data="flavor_chocolate"),
                InlineKeyboardButton("⚪ Ваниль", callback_data="flavor_vanilla"),
            ],
            [
                InlineKeyboardButton("🍓 Клубника", callback_data="flavor_strawberry"),
                InlineKeyboardButton("🟢 Мята", callback_data="flavor_mint"),
            ],
            [
                InlineKeyboardButton("🟤 Карамель", callback_data="flavor_caramel"),
                InlineKeyboardButton("🔵 Голубика", callback_data="flavor_blueberry"),
            ],
            [InlineKeyboardButton("📊 Подробная статистика", callback_data="show_stats")],
            [InlineKeyboardButton("🔄 Сбросить счетчик", callback_data="reset_counter")],
        ])
        await query.edit_message_text(
            text=f"🍦 Счетчик мороженого\n\n{stats_text}",
            reply_markup=keyboard,
            parse_mode="HTML"
        )
        return
    elif data == "check_drop":
        await check_ice_cream_drop(update, context)
        return
    elif data == "add_to_stats":
        # Добавляем последний полученный вкус в статистику
        if user_data[user_id]["collection"]:
            last_flavor = max(user_data[user_id]["collection"].items(), key=lambda x: x[1])[0]
            user_data[user_id]["ice_cream_count"] += 1
            user_data[user_id]["flavors"][last_flavor] += 1
            user_data[user_id]["dates"][today] += 1
            user_data[user_id]["history"].append({
                "date": datetime.now().strftime("%d.%m.%Y %H:%M"),
                "count": 1,
                "flavor": last_flavor
            })
            await query.answer(f"🍦 {last_flavor.capitalize()} добавлено в статистику!")
        else:
            await query.answer("У вас нет мороженого в коллекции!")
        return
    
    # Обновляем сообщение
    stats_text = generate_ice_cream_stats(user_data[user_id])
    keyboard = InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🍫 Шоколад", callback_data="flavor_chocolate"),
            InlineKeyboardButton("⚪ Ваниль", callback_data="flavor_vanilla"),
        ],
        [
            InlineKeyboardButton("🍓 Клубника", callback_data="flavor_strawberry"),
            InlineKeyboardButton("🟢 Мята", callback_data="flavor_mint"),
        ],
        [
            InlineKeyboardButton("🟤 Карамель", callback_data="flavor_caramel"),
            InlineKeyboardButton("🔵 Голубика", callback_data="flavor_blueberry"),
        ],
        [InlineKeyboardButton("📊 Подробная статистика", callback_data="show_stats")],
        [InlineKeyboardButton("🔄 Сбросить счетчик", callback_data="reset_counter")],
    ])
    await query.edit_message_text(
        text=f"🍦 Счетчик мороженого\n\n{stats_text}",
        reply_markup=keyboard,
        parse_mode="HTML"
    )

async def show_commands(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Список команд."""
    text = """
<b>📋 Доступные команды:</b>

/start - Начать работу с ботом
/profile - Показать мой профиль
/social - Мои социальные сети
/projects - Мои проекты с ссылками
/ice_cream - Счетчик мороженого
/collection - Моя коллекция мороженого
/commands - Показать все команды

<i>Вы также можете использовать кнопки меню</i>
"""
    await update.message.reply_text(text, parse_mode="HTML")

def main() -> None:
    """Запуск бота."""
    application = Application.builder().token("7229958377:AAHBaIbaHo7sHhudrtZDbHgBpiZCTUzTnkI").build()

    # Обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("profile", profile))
    application.add_handler(CommandHandler("social", social_media))
    application.add_handler(CommandHandler("projects", projects))
    application.add_handler(CommandHandler("ice_cream", ice_cream_counter))
    application.add_handler(CommandHandler("collection", show_collection))
    application.add_handler(CommandHandler("commands", show_commands))

    # Обработчики сообщений (кнопки)
    application.add_handler(MessageHandler(filters.Text(["👤 Профиль"]), profile))
    application.add_handler(MessageHandler(filters.Text(["🌐 Соцсети"]), social_media))
    application.add_handler(MessageHandler(filters.Text(["📂 Проекты"]), projects))
    application.add_handler(MessageHandler(filters.Text(["🍦 Счетчик мороженого"]), ice_cream_counter))
    application.add_handler(MessageHandler(filters.Text(["🎁 Коллекция"]), show_collection))
    application.add_handler(MessageHandler(filters.Text(["📋 Команды"]), show_commands))

    # Обработчик inline-кнопок
    application.add_handler(CallbackQueryHandler(button_click))

    # Запуск бота
    application.run_polling()

if __name__ == "__main__":
    main()
