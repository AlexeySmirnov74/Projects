# Алексей Смирнов — проекты и разработки

**[Открыть портфолио → projects.alexeysmirnov.ru](https://projects.alexeysmirnov.ru/)**

Открытые разработки на стыке электроники, системного программирования и AI-инфраструктуры.

| Проект | Описание | Стек |
| --- | --- | --- |
| [YRM100X PRO](https://github.com/AlexeySmirnov74/YRM100X_PRO) | UHF RFID-инструмент для Flipper Zero и считывателей YRM100X. | C, Flipper Zero, UART |
| [A100 MIG Lab](https://github.com/AlexeySmirnov74/a100-mig-lab) | Три LLM, отдельная стресс-нагрузка и мониторинг на одной NVIDIA A100 40GB. | Python, Docker, NVIDIA MIG, LiteLLM, Grafana |
| [USB to Network Bridge](https://github.com/AlexeySmirnov74/USB-to-Network-Bridge) | Подключение USB-устройств к Windows-компьютеру по сети. | Rust, Win32, USB/IP |
| [MLup Distributed](https://github.com/AlexeySmirnov74/mlup-distributed) | Распределённый ML-сервинг на базе MLup с очередью Redis и независимыми воркерами. | Python, FastAPI, Redis |
| [Нева 306: reverse engineering](https://alexeysmirnov74.github.io/Neva306IS0ReverseEngineering/) | Исследование EEPROM, формата данных и дампов памяти электросчётчика. | AutoIt, EEPROM, CH341A |

Скриншоты A100 сохранены из исходного эксперимента. Ограничения проверки текущей версии описаны в README проекта; портфолио не заявляет новые измерения производительности.

Другие публичные репозитории:

- [Telegram WinHTTP UDF](https://github.com/AlexeySmirnov74/telegram-winhttp-udf-autoit) — форк библиотеки Telegram Bot API для AutoIt.
- [Flipper Application Catalog](https://github.com/AlexeySmirnov74/flipper-application-catalog) — форк каталога приложений Flipper Zero.
- [JupyterFlow](https://github.com/AlexeySmirnov74/JupyterFlow) — заготовка без опубликованного кода и описания.
- [Projects](https://github.com/AlexeySmirnov74/Projects) — исходный код этого портфолио.

Полнота списка проверена по публичному GitHub API 11 ноября 2026 года: учтены все 9 репозиториев.

## Устройство сайта

Статический HTML, CSS и JavaScript. Зависимости и сборка не нужны. GitHub Pages публикует корень ветки `master`; `CNAME` сохраняет домен `projects.alexeysmirnov.ru`, а `.nojekyll` отключает обработку Jekyll. Прежняя настройка `_config.yml` сохранена для истории, но к новому HTML не применяется.

- `index.html` — контент, карточки, ссылки и метаданные.
- `assets/style.css` — дизайн и адаптивные стили.
- `assets/app.js` — поиск и фильтры; без JavaScript все проекты остаются доступны.
- `assets/motion.css` и `assets/motion.js` — контурные волны и лёгкий 3D-параллакс первого экрана. Анимации останавливаются вне экрана и при скрытой вкладке; `prefers-reduced-motion` оставляет статичную композицию.
- `assets/images/` и `assets/fonts/` — локальные изображения и Manrope; сторонние CDN не требуются.
- `assets/sources.json` — источники фотографий, скриншотов и шрифтов. Лицензия шрифта находится в `assets/fonts/OFL.txt`.

Для локального просмотра из корня репозитория можно запустить `python -m http.server 8000`, затем открыть `http://localhost:8000`.

При добавлении проекта обновите карточку в HTML, счётчики фильтров и навигации, список репозиториев и дату проверки. Изображения добавляйте в WebP с текстовым описанием `alt` и записью об источнике.

Размеры текста заданы в `rem` и плавно адаптируются к ширине окна: основной текст 16–20 px, категории и теги 14–16 px, ссылки 16 px при стандартном размере шрифта браузера. Они учитывают пользовательское увеличение шрифта. На широких экранах ширина контента ограничена 1440 px.

## Контакты

[mail@alexeysmirnov.ru](mailto:mail@alexeysmirnov.ru) · [Личный сайт](https://alexeysmirnov.ru/) · [GitHub](https://github.com/AlexeySmirnov74)
