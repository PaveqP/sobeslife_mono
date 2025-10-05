-- Заполнение таблицы профессий
INSERT INTO
    profession (name)
VALUES ('Frontend Developer'),
    ('Backend Developer'),
    ('Fullstack Developer'),
    ('DevOps Engineer'),
    ('Data Scientist'),
    ('Mobile Developer'),
    ('QA Engineer'),
    ('Security Engineer'),
    ('Machine Learning Engineer'),
    ('Cloud Engineer');

-- Заполнение таблицы технологий
INSERT INTO
    technology (name)
VALUES ('JavaScript'),
    ('TypeScript'),
    ('React'),
    ('Vue.js'),
    ('Angular'),
    ('Node.js'),
    ('Python'),
    ('Java'),
    ('Go'),
    ('Rust'),
    ('C#'),
    ('PHP'),
    ('Ruby'),
    ('Swift'),
    ('Kotlin'),
    ('Docker'),
    ('Kubernetes'),
    ('AWS'),
    ('Azure'),
    ('GCP'),
    ('PostgreSQL'),
    ('MySQL'),
    ('MongoDB'),
    ('Redis'),
    ('Elasticsearch'),
    ('Git'),
    ('Linux'),
    ('Nginx'),
    ('GraphQL'),
    ('REST API'),
    ('TensorFlow'),
    ('PyTorch'),
    ('Pandas'),
    ('NumPy'),
    ('Scikit-learn'),
    ('Spring Boot'),
    ('.NET'),
    ('Django'),
    ('Flask'),
    ('Express.js'),
    ('React Native'),
    ('Flutter'),
    ('Android'),
    ('iOS'),
    ('Xamarin'),
    ('Selenium'),
    ('Jest'),
    ('Cypress'),
    ('JUnit'),
    ('PyTest');

-- Заполнение таблицы разделов (chapters)
INSERT INTO
    chapter (name)
VALUES ('Основы программирования'),
    (
        'Структуры данных и алгоритмы'
    ),
    ('Базы данных'),
    ('Веб-разработка'),
    ('Мобильная разработка'),
    ('DevOps и инфраструктура'),
    ('Безопасность'),
    ('Тестирование'),
    ('Архитектура и паттерны'),
    ('Инструменты разработки'),
    ('Операционные системы'),
    ('Сети и протоколы'),
    ('Машинное обучение'),
    ('Микросервисы'),
    ('Контейнеризация');

-- Связь профессий с разделами
INSERT INTO
    profession_chapter (profession_id, chapter_id)
VALUES
    -- Frontend Developer
    (1, 1),
    (1, 2),
    (1, 4),
    (1, 8),
    (1, 10),
    -- Backend Developer  
    (2, 1),
    (2, 2),
    (2, 3),
    (2, 4),
    (2, 9),
    (2, 11),
    (2, 12),
    -- Fullstack Developer
    (3, 1),
    (3, 2),
    (3, 3),
    (3, 4),
    (3, 8),
    (3, 9),
    (3, 10),
    -- DevOps Engineer
    (4, 3),
    (4, 6),
    (4, 11),
    (4, 12),
    (4, 15),
    -- Data Scientist
    (5, 1),
    (5, 2),
    (5, 3),
    (5, 13),
    -- Mobile Developer
    (6, 1),
    (6, 2),
    (6, 5),
    (6, 8),
    -- QA Engineer
    (7, 1),
    (7, 8),
    (7, 10),
    -- Security Engineer
    (8, 7),
    (8, 11),
    (8, 12),
    -- Machine Learning Engineer
    (9, 1),
    (9, 2),
    (9, 13),
    -- Cloud Engineer
    (10, 3),
    (10, 6),
    (10, 11),
    (10, 12),
    (10, 15);

-- Связь разделов с технологиями
INSERT INTO
    chapter_technology (chapter_id, technology_id)
VALUES
    -- Основы программирования
    (1, 1),
    (1, 2),
    (1, 7),
    (1, 8),
    (1, 9),
    (1, 10),
    (1, 11),
    (1, 12),
    (1, 13),
    -- Структуры данных и алгоритмы
    (2, 1),
    (2, 2),
    (2, 7),
    (2, 8),
    (2, 9),
    (2, 10),
    -- Базы данных
    (3, 21),
    (3, 22),
    (3, 23),
    (3, 24),
    (3, 25),
    -- Веб-разработка
    (4, 1),
    (4, 2),
    (4, 3),
    (4, 4),
    (4, 5),
    (4, 6),
    (4, 7),
    (4, 11),
    (4, 12),
    (4, 29),
    (4, 30),
    -- Мобильная разработка
    (5, 14),
    (5, 15),
    (5, 42),
    (5, 43),
    (5, 44),
    (5, 45),
    -- DevOps и инфраструктура
    (6, 16),
    (6, 17),
    (6, 18),
    (6, 19),
    (6, 20),
    (6, 26),
    (6, 27),
    (6, 28),
    -- Безопасность
    (7, 7),
    (7, 8),
    (7, 11),
    (7, 12),
    -- Тестирование
    (8, 46),
    (8, 47),
    (8, 48),
    (8, 49),
    (8, 50),
    -- Архитектура и паттерны
    (9, 8),
    (9, 11),
    (9, 36),
    (9, 37),
    (9, 38),
    (9, 39),
    (9, 40),
    -- Инструменты разработки
    (10, 26),
    (10, 27),
    (10, 28),
    -- Операционные системы
    (11, 27),
    -- Сети и протоколы
    (12, 29),
    (12, 30),
    -- Машинное обучение
    (13, 7),
    (13, 31),
    (13, 32),
    (13, 33),
    (13, 34),
    (13, 35),
    -- Микросервисы
    (14, 6),
    (14, 8),
    (14, 11),
    (14, 36),
    (14, 37),
    -- Контейнеризация
    (15, 16),
    (15, 17);

-- Заполнение таблицы пользователей
INSERT INTO
    users (
        nickname,
        email,
        phone_number,
        password_hash,
        is_admin,
        date_of_birth,
        profession_id,
        expertise_level
    )
VALUES (
        'admin',
        'admin@sobeslife.com',
        '+79990000001',
        'admin_hash_123',
        TRUE,
        '1990-01-01',
        1,
        'senior'
    ),
    (
        'ivan_dev',
        'ivan@mail.com',
        '+79990000002',
        'user_hash_456',
        FALSE,
        '1995-05-15',
        2,
        'middle'
    ),
    (
        'maria_qa',
        'maria@mail.com',
        '+79990000003',
        'user_hash_789',
        FALSE,
        '1992-08-20',
        7,
        'junior'
    ),
    (
        'alex_ml',
        'alex@mail.com',
        '+79990000004',
        'user_hash_101',
        FALSE,
        '1988-12-10',
        9,
        'senior'
    ),
    (
        'sasha_front',
        'sasha@mail.com',
        '+79990000005',
        'user_hash_102',
        FALSE,
        '1998-03-25',
        1,
        'trainee'
    );

-- Заполнение таблицы вопросов (100+ вопросов по разным направлениям)
INSERT INTO
    question (
        text,
        correct_answer,
        profession_id,
        chapter_id,
        technology_id,
        expertise_level
    )
VALUES
    -- JavaScript/TypeScript вопросы
    (
        'Что такое замыкание (closure) в JavaScript?',
        'Функция вместе с лексическим окружением, в котором она была определена',
        1,
        1,
        1,
        'junior'
    ),
    (
        'В чем разница между let, const и var?',
        'var - function scope, let/const - block scope, const нельзя переопределить',
        1,
        1,
        1,
        'junior'
    ),
    (
        'Что такое Promise в JavaScript?',
        'Объект представляющий результат асинхронной операции',
        1,
        1,
        1,
        'middle'
    ),
    (
        'Как работает event loop в JavaScript?',
        'Механизм обработки асинхронных операций через call stack, callback queue и microtask queue',
        1,
        1,
        1,
        'senior'
    ),
    (
        'Что такое hoisting в JavaScript?',
        'Поднятие объявлений переменных и функций в начало области видимости',
        1,
        1,
        1,
        'junior'
    ),

-- React вопросы
(
    'В чем разница между React классом и функциональным компонентом?',
    'Функциональные компоненты используют хуки, классы - методы жизненного цикла',
    1,
    4,
    3,
    'middle'
),
(
    'Что такое Virtual DOM?',
    'Легковесная копия реального DOM для оптимизации обновлений',
    1,
    4,
    3,
    'junior'
),
(
    'Как работает useEffect?',
    'Хук для side effects, принимает функцию и массив зависимостей',
    1,
    4,
    3,
    'middle'
),
(
    'Что такое React Context?',
    'Механизм для передачи данных через дерево компонентов без пропсов',
    1,
    4,
    3,
    'middle'
),
(
    'Как оптимизировать производительность React приложения?',
    'React.memo, useMemo, useCallback, код-сплиттинг',
    1,
    4,
    3,
    'senior'
),

-- Node.js вопросы
(
    'Что такое event-driven architecture в Node.js?',
    'Архитектура, где поток выполнения определяется событиями',
    2,
    4,
    6,
    'middle'
),
(
    'Как работает EventEmitter?',
    'Класс для реализации паттерна наблюдатель в Node.js',
    2,
    4,
    6,
    'middle'
),
(
    'В чем разница между require и import?',
    'require - CommonJS, import - ES6 modules',
    2,
    4,
    6,
    'junior'
),
(
    'Что такое поток (stream) в Node.js?',
    'Абстракция для работы с данными, которые читаются/пишутся постепенно',
    2,
    4,
    6,
    'senior'
),
(
    'Как работает цикл событий в Node.js?',
    'Однопоточный цикл, обрабатывающий асинхронные операции через фазы',
    2,
    4,
    6,
    'senior'
),

-- Python вопросы
(
    'Что такое list comprehension?',
    'Краткий способ создания списков',
    2,
    1,
    7,
    'junior'
),
(
    'В чем разница между списком и кортежем?',
    'Список изменяемый, кортеж - нет',
    2,
    1,
    7,
    'junior'
),
(
    'Что такое декоратор в Python?',
    'Функция, которая принимает другую функцию и расширяет её поведение',
    2,
    1,
    7,
    'middle'
),
(
    'Как работает GIL в Python?',
    'Global Interpreter Lock - механизм, позволяющий выполнять только один поток Python за раз',
    2,
    1,
    7,
    'senior'
),
(
    'Что такое генераторы в Python?',
    'Функции, которые возвращают итератор с yield',
    2,
    1,
    7,
    'middle'
),

-- Базы данных вопросы
(
    'В чем разница между INNER JOIN и LEFT JOIN?',
    'INNER JOIN - только совпадающие строки, LEFT JOIN - все строки из левой таблицы',
    2,
    3,
    21,
    'junior'
),
(
    'Что такое нормализация базы данных?',
    'Процесс организации данных для уменьшения избыточности',
    2,
    3,
    21,
    'middle'
),
(
    'Что такое транзакция в БД?',
    'Последовательность операций, выполняемых как единое целое (ACID)',
    2,
    3,
    21,
    'middle'
),
(
    'Что такое индексы и зачем они нужны?',
    'Структуры для ускорения поиска данных',
    2,
    3,
    21,
    'junior'
),
(
    'В чем разница между SQL и NoSQL?',
    'SQL - реляционные, строгая схема; NoSQL - нереляционные, гибкая схема',
    2,
    3,
    21,
    'middle'
),

-- Алгоритмы и структуры данных
(
    'Что такое Big O notation?',
    'Метод оценки сложности алгоритмов',
    1,
    2,
    NULL,
    'junior'
),
(
    'В чем разница между массивом и связным списком?',
    'Массив - непрерывная память, список - узлы с указателями',
    1,
    2,
    NULL,
    'junior'
),
(
    'Как работает бинарный поиск?',
    'Поиск в отсортированном массиве путем деления пополам',
    1,
    2,
    NULL,
    'middle'
),
(
    'Что такое хэш-таблица?',
    'Структура данных, реализующая ассоциативный массив',
    1,
    2,
    NULL,
    'middle'
),
(
    'Как работает алгоритм быстрой сортировки?',
    'Divide and conquer с выбором опорного элемента',
    1,
    2,
    NULL,
    'middle'
),

-- Docker вопросы
(
    'Что такое Docker контейнер?',
    'Изолированная среда для запуска приложения',
    4,
    15,
    16,
    'junior'
),
(
    'В чем разница между COPY и ADD в Dockerfile?',
    'ADD поддерживает распаковку архивов и URL, COPY - только копирование файлов',
    4,
    15,
    16,
    'middle'
),
(
    'Что такое Docker volume?',
    'Механизм для persistent data в контейнерах',
    4,
    15,
    16,
    'middle'
),
(
    'Как работает Docker network?',
    'Механизм для связи между контейнерами',
    4,
    15,
    16,
    'middle'
),
(
    'Что такое multi-stage build в Docker?',
    'Сборка в несколько этапов для уменьшения размера образа',
    4,
    15,
    16,
    'senior'
),

-- Kubernetes вопросы
(
    'Что такое Pod в Kubernetes?',
    'Наименьшая deployable unit, содержащая один или несколько контейнеров',
    4,
    15,
    17,
    'middle'
),
(
    'В чем разница между Deployment и StatefulSet?',
    'Deployment для stateless, StatefulSet для stateful приложений',
    4,
    15,
    17,
    'senior'
),
(
    'Что такое Service в Kubernetes?',
    'Абстракция для доступа к группе Pods',
    4,
    15,
    17,
    'middle'
),
(
    'Как работает Ingress?',
    'API объект для управления внешним доступом к сервисам',
    4,
    15,
    17,
    'senior'
),
(
    'Что такое ConfigMap и Secret?',
    'Способы хранения конфигурации и чувствительных данных',
    4,
    15,
    17,
    'middle'
),

-- Go вопросы
(
    'Что такое goroutine?',
    'Легковесный поток, управляемый Go runtime',
    2,
    1,
    9,
    'junior'
),
(
    'Как работает канал (channel) в Go?',
    'Типизированный conduit для связи между goroutines',
    2,
    1,
    9,
    'middle'
),
(
    'В чем разница между буферизированным и небуферизированным каналом?',
    'Буферизированный имеет емкость, небуферизированный - синхронный',
    2,
    1,
    9,
    'middle'
),
(
    'Что такое interface в Go?',
    'Набор методов, определяющий поведение',
    2,
    1,
    9,
    'junior'
),
(
    'Как работает garbage collector в Go?',
    'Concurrent mark-and-sweep сборщик мусора',
    2,
    1,
    9,
    'senior'
),

-- Java вопросы
(
    'В чем разница между ArrayList и LinkedList?',
    'ArrayList - массив, быстрый доступ; LinkedList - список, быстрая вставка/удаление',
    2,
    1,
    8,
    'junior'
),
(
    'Что такое JVM?',
    'Java Virtual Machine - виртуальная машина для выполнения Java байт-кода',
    2,
    1,
    8,
    'junior'
),
(
    'Как работает garbage collection в Java?',
    'Автоматическое освобождение памяти от неиспользуемых объектов',
    2,
    1,
    8,
    'middle'
),
(
    'Что такое Spring Framework?',
    'Фреймворк для enterprise Java приложений',
    2,
    9,
    36,
    'middle'
),
(
    'В чем разница между @Autowired и @Resource?',
    '@Autowired - Spring, по типу; @Resource - JSR-250, по имени',
    2,
    9,
    36,
    'senior'
),

-- Машинное обучение вопросы
(
    'Что такое overfitting?',
    'Когда модель слишком хорошо обучается на тренировочных данных и плохо обобщает',
    9,
    13,
    31,
    'junior'
),
(
    'В чем разница между supervised и unsupervised learning?',
    'Supervised - с метками, unsupervised - без меток',
    9,
    13,
    31,
    'junior'
),
(
    'Что такое gradient descent?',
    'Алгоритм оптимизации для минимизации функции потерь',
    9,
    13,
    31,
    'middle'
),
(
    'Как работает нейронная сеть?',
    'Сеть нейронов, передающих сигналы через взвешенные связи',
    9,
    13,
    31,
    'middle'
),
(
    'Что такое CNN?',
    'Convolutional Neural Network - для обработки изображений',
    9,
    13,
    31,
    'senior'
),

-- Тестирование вопросы
(
    'В чем разница между unit test и integration test?',
    'Unit test - один модуль, integration test - взаимодействие модулей',
    7,
    8,
    46,
    'junior'
),
(
    'Что такое TDD?',
    'Test-Driven Development - разработка через тестирование',
    7,
    8,
    46,
    'middle'
),
(
    'Как работает Selenium?',
    'Фреймворк для автоматизации веб-браузеров',
    7,
    8,
    46,
    'middle'
),
(
    'Что такое mock объекты?',
    'Имитация реальных объектов для изоляции тестов',
    7,
    8,
    46,
    'middle'
),
(
    'В чем разница между stub и mock?',
    'Stub - возвращает заранее определенные данные, mock - проверяет взаимодействия',
    7,
    8,
    46,
    'senior'
),

-- Безопасность вопросы
(
    'Что такое SQL injection?',
    'Уязвимость, когда злоумышленник может выполнить произвольный SQL код',
    8,
    7,
    NULL,
    'junior'
),
(
    'Как работает HTTPS?',
    'HTTP поверх TLS/SSL для шифрования соединения',
    8,
    7,
    NULL,
    'middle'
),
(
    'Что такое XSS attack?',
    'Cross-site scripting - внедрение malicious scripts в веб-страницы',
    8,
    7,
    NULL,
    'middle'
),
(
    'В чем разница между symmetric и asymmetric encryption?',
    'Symmetric - один ключ, asymmetric - пара ключей (public/private)',
    8,
    7,
    NULL,
    'middle'
),
(
    'Что такое OAuth 2.0?',
    'Протокол авторизации для делегирования доступа',
    8,
    7,
    NULL,
    'senior'
),

-- Дополнительные вопросы по разным технологиям
(
    'Что такое GraphQL?',
    'Язык запросов для API, позволяющий клиенту запрашивать только нужные данные',
    2,
    4,
    29,
    'middle'
),
(
    'Как работает Redis?',
    'In-memory data structure store, используемый как база данных, кэш и брокер сообщений',
    2,
    3,
    24,
    'middle'
),
(
    'Что такое microservices architecture?',
    'Архитектурный стиль, где приложение состоит из небольших независимых сервисов',
    2,
    14,
    NULL,
    'senior'
),
(
    'В чем разница между monolithic и microservices?',
    'Monolithic - единое приложение, microservices - распределенная система',
    2,
    14,
    NULL,
    'middle'
),
(
    'Что такое REST API?',
    'Архитектурный стиль для веб-сервисов с использованием HTTP методов',
    2,
    4,
    30,
    'junior'
);

-- Создание тестов
INSERT INTO
    test (
        title,
        profession_id,
        chapter_id,
        technology_id,
        expertise_level
    )
VALUES (
        'JavaScript Fundamentals Test',
        1,
        1,
        1,
        'junior'
    ),
    (
        'React Advanced Test',
        1,
        4,
        3,
        'senior'
    ),
    (
        'Node.js Backend Test',
        2,
        4,
        6,
        'middle'
    ),
    (
        'Python Programming Test',
        2,
        1,
        7,
        'middle'
    ),
    (
        'Database Design Test',
        2,
        3,
        21,
        'middle'
    ),
    (
        'Docker & Kubernetes Test',
        4,
        15,
        16,
        'senior'
    ),
    (
        'Go Concurrency Test',
        2,
        1,
        9,
        'senior'
    ),
    (
        'Java Spring Test',
        2,
        9,
        36,
        'middle'
    ),
    (
        'Machine Learning Basics',
        9,
        13,
        31,
        'junior'
    ),
    (
        'Security Fundamentals',
        8,
        7,
        NULL,
        'middle'
    );

-- Связь вопросов с тестами
INSERT INTO
    test_question (test_id, question_id)
VALUES
    -- JavaScript Fundamentals Test
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 5),
    -- React Advanced Test  
    (2, 6),
    (2, 7),
    (2, 8),
    (2, 9),
    (2, 10),
    -- Node.js Backend Test
    (3, 11),
    (3, 12),
    (3, 13),
    (3, 14),
    (3, 15),
    -- Python Programming Test
    (4, 16),
    (4, 17),
    (4, 18),
    (4, 19),
    (4, 20),
    -- Database Design Test
    (5, 21),
    (5, 22),
    (5, 23),
    (5, 24),
    (5, 25),
    -- Docker & Kubernetes Test
    (6, 31),
    (6, 32),
    (6, 33),
    (6, 34),
    (6, 35),
    (6, 36),
    (6, 37),
    (6, 38),
    (6, 39),
    -- Go Concurrency Test
    (7, 41),
    (7, 42),
    (7, 43),
    (7, 44),
    (7, 45),
    -- Java Spring Test
    (8, 46),
    (8, 47),
    (8, 48),
    (8, 49),
    (8, 50),
    -- Machine Learning Basics
    (9, 51),
    (9, 52),
    (9, 53),
    (9, 54),
    (9, 55),
    -- Security Fundamentals
    (10, 56),
    (10, 57),
    (10, 58),
    (10, 59),
    (10, 60);

-- Связь вопросов с технологиями (для вопросов, которые связаны с несколькими технологиями)
INSERT INTO
    question_technology (question_id, technology_id)
VALUES
    -- Мульти-технологические вопросы
    (29, 1),
    (29, 2), -- GraphQL может использоваться с разными языками
    (30, 24), -- Redis
    (31, 16),
    (31, 17), -- Microservices с Docker/K8s
    (32, 16),
    (32, 17), -- Monolithic vs Microservices
    (33, 1),
    (33, 2),
    (33, 7),
    (33, 8);
-- REST API для разных языков

-- Заполнение истории тестирования пользователей
INSERT INTO
    user_test (
        user_id,
        test_id,
        test_status,
        score,
        started_at,
        completed_at
    )
VALUES (
        2,
        1,
        'completed',
        85,
        '2024-01-15 10:00:00',
        '2024-01-15 11:30:00'
    ),
    (
        2,
        3,
        'completed',
        92,
        '2024-01-20 14:00:00',
        '2024-01-20 15:45:00'
    ),
    (
        3,
        9,
        'completed',
        78,
        '2024-01-18 09:30:00',
        '2024-01-18 10:45:00'
    ),
    (
        4,
        6,
        'in_progress',
        NULL,
        '2024-01-22 16:00:00',
        NULL
    ),
    (
        5,
        1,
        'completed',
        65,
        '2024-01-17 13:00:00',
        '2024-01-17 14:20:00'
    ),
    (
        2,
        5,
        'assigned',
        NULL,
        NULL,
        NULL
    ),
    (
        3,
        10,
        'completed',
        88,
        '2024-01-19 11:00:00',
        '2024-01-19 12:15:00'
    );

-- Дополнительные вопросы для большего разнообразия (еще 20+ вопросов)
INSERT INTO
    question (
        text,
        correct_answer,
        profession_id,
        chapter_id,
        technology_id,
        expertise_level
    )
VALUES (
        'Что такое CSS Grid?',
        'Система макета для двумерного размещения элементов',
        1,
        4,
        NULL,
        'junior'
    ),
    (
        'Как работает Flexbox?',
        'Одномерная система макета для гибкого распределения пространства',
        1,
        4,
        NULL,
        'junior'
    ),
    (
        'Что такое Webpack?',
        'Сборщик модулей для JavaScript приложений',
        1,
        10,
        1,
        'middle'
    ),
    (
        'В чем разница между HTTP/1.1 и HTTP/2?',
        'HTTP/2 multiplexing, header compression, server push',
        2,
        12,
        NULL,
        'senior'
    ),
    (
        'Что такое WebSocket?',
        'Протокол для full-duplex связи через одно TCP соединение',
        2,
        12,
        NULL,
        'middle'
    ),
    (
        'Как работает JWT?',
        'JSON Web Token - стандарт для создания access tokens',
        2,
        7,
        NULL,
        'middle'
    ),
    (
        'Что такое CI/CD?',
        'Continuous Integration/Continuous Deployment - автоматизация сборки и развертывания',
        4,
        6,
        NULL,
        'middle'
    ),
    (
        'В чем разница между VM и контейнером?',
        'VM - полная изоляция ОС, контейнер - изоляция процессов',
        4,
        15,
        16,
        'junior'
    ),
    (
        'Что такое Terraform?',
        'Infrastructure as Code tool для управления облачной инфраструктурой',
        4,
        6,
        18,
        'senior'
    ),
    (
        'Как работает load balancer?',
        'Распределение сетевого трафика между серверами',
        4,
        12,
        NULL,
        'middle'
    ),
    (
        'Что такое Apache Kafka?',
        'Распределенная streaming платформа',
        2,
        14,
        NULL,
        'senior'
    ),
    (
        'В чем разница между SQL и NoSQL?',
        'SQL - реляционные, ACID; NoSQL - нереляционные, BASE',
        2,
        3,
        NULL,
        'junior'
    ),
    (
        'Что такое Redis pub/sub?',
        'Механизм публикации/подписки в Redis',
        2,
        3,
        24,
        'middle'
    ),
    (
        'Как работает React Router?',
        'Библиотека для маршрутизации в React приложениях',
        1,
        4,
        3,
        'middle'
    ),
    (
        'Что такое Redux?',
        'Predictable state container для JavaScript приложений',
        1,
        4,
        3,
        'middle'
    ),
    (
        'В чем разница между state и props в React?',
        'State - внутренние данные компонента, props - данные от родителя',
        1,
        4,
        3,
        'junior'
    ),
    (
        'Что такое TypeScript generics?',
        'Шаблоны для создания reusable компонентов',
        1,
        1,
        2,
        'middle'
    ),
    (
        'Как работает async/await в JavaScript?',
        'Синтаксический сахар для работы с Promise',
        1,
        1,
        1,
        'middle'
    ),
    (
        'Что такое WebAssembly?',
        'Бинарный формат для выполнения кода в браузере',
        1,
        4,
        NULL,
        'senior'
    ),
    (
        'В чем разница между cookies, localStorage и sessionStorage?',
        'Cookies - серверные, localStorage - постоянное хранение, sessionStorage - сессионное',
        1,
        4,
        1,
        'junior'
    );

-- Добавляем дополнительные вопросы в тесты
INSERT INTO
    test_question (test_id, question_id)
VALUES (1, 66),
    (1, 67),
    (1, 78),
    (1, 80), -- JavaScript test
    (2, 74),
    (2, 75), -- React test
    (3, 69),
    (3, 70), -- Node.js test
    (6, 68),
    (6, 71);
-- DevOps test

COMMIT;

-- Проверка количества созданных вопросов
SELECT 'Total questions: ' || COUNT(*) as count_info
FROM question
UNION ALL
SELECT 'Questions by profession: ' || p.name || ': ' || COUNT(q.id)
FROM profession p
    LEFT JOIN question q ON p.id = q.profession_id
GROUP BY
    p.id,
    p.name
UNION ALL
SELECT 'Questions by technology: ' || t.name || ': ' || COUNT(q.id)
FROM technology t
    LEFT JOIN question q ON t.id = q.technology_id
GROUP BY
    t.id,
    t.name
HAVING
    COUNT(q.id) > 0
ORDER BY count_info;