--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Debian 16.8-1.pgdg120+1)
-- Dumped by pg_dump version 16.8 (Debian 16.8-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: expertise_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expertise_level AS ENUM (
    'trainee',
    'junior',
    'middle',
    'senior'
);


ALTER TYPE public.expertise_level OWNER TO postgres;

--
-- Name: test_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.test_status AS ENUM (
    'assigned',
    'in_progress',
    'completed',
    'expired',
    'cancelled'
);


ALTER TYPE public.test_status OWNER TO postgres;

--
-- Name: interview_message_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interview_message_role AS ENUM (
    'assistant',
    'user'
);


ALTER TYPE public.interview_message_role OWNER TO postgres;

--
-- Name: interview_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.interview_status AS ENUM (
    'in_progress',
    'completed',
    'summary_failed'
);


ALTER TYPE public.interview_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chapter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapter (
    id integer NOT NULL,
    name character varying(300)
);


ALTER TABLE public.chapter OWNER TO postgres;

--
-- Name: chapter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chapter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chapter_id_seq OWNER TO postgres;

--
-- Name: chapter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chapter_id_seq OWNED BY public.chapter.id;


--
-- Name: chapter_technology; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapter_technology (
    id integer NOT NULL,
    chapter_id integer,
    technology_id integer
);


ALTER TABLE public.chapter_technology OWNER TO postgres;

--
-- Name: chapter_technology_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chapter_technology_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chapter_technology_id_seq OWNER TO postgres;

--
-- Name: chapter_technology_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chapter_technology_id_seq OWNED BY public.chapter_technology.id;


--
-- Name: profession; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profession (
    id integer NOT NULL,
    name character varying(300)
);


ALTER TABLE public.profession OWNER TO postgres;

--
-- Name: profession_chapter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profession_chapter (
    id integer NOT NULL,
    profession_id integer,
    chapter_id integer
);


ALTER TABLE public.profession_chapter OWNER TO postgres;

--
-- Name: profession_chapter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profession_chapter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profession_chapter_id_seq OWNER TO postgres;

--
-- Name: profession_chapter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profession_chapter_id_seq OWNED BY public.profession_chapter.id;


--
-- Name: profession_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profession_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profession_id_seq OWNER TO postgres;

--
-- Name: profession_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profession_id_seq OWNED BY public.profession.id;


--
-- Name: interview_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_message (
    id integer NOT NULL,
    interview_id integer NOT NULL,
    sequence_no integer NOT NULL,
    role public.interview_message_role NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT interview_message_sequence_no_check CHECK ((sequence_no > 0))
);


ALTER TABLE public.interview_message OWNER TO postgres;

--
-- Name: interview_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interview_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interview_message_id_seq OWNER TO postgres;

--
-- Name: interview_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interview_message_id_seq OWNED BY public.interview_message.id;


--
-- Name: interview_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_session (
    id integer NOT NULL,
    user_id integer NOT NULL,
    profession_id integer NOT NULL,
    interview_level public.expertise_level NOT NULL,
    status public.interview_status DEFAULT 'in_progress'::public.interview_status NOT NULL,
    duration_minutes integer NOT NULL,
    profile_snapshot jsonb NOT NULL,
    prompt_version character varying(100),
    llm_provider character varying(100),
    llm_model character varying(200),
    verdict_passed boolean,
    summary text,
    strengths jsonb,
    weaknesses jsonb,
    recommendations jsonb,
    started_at timestamp without time zone NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    finished_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT interview_session_check CHECK ((expires_at > started_at)),
    CONSTRAINT interview_session_duration_minutes_check CHECK ((duration_minutes > 0))
);


ALTER TABLE public.interview_session OWNER TO postgres;

--
-- Name: interview_session_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interview_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interview_session_id_seq OWNER TO postgres;

--
-- Name: interview_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interview_session_id_seq OWNED BY public.interview_session.id;


--
-- Name: question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question (
    id integer NOT NULL,
    text text NOT NULL,
    correct_answer character varying(400),
    profession_id integer NOT NULL,
    chapter_id integer NOT NULL,
    technology_id integer,
    expertise_level public.expertise_level
);


ALTER TABLE public.question OWNER TO postgres;

--
-- Name: question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_id_seq OWNER TO postgres;

--
-- Name: question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_id_seq OWNED BY public.question.id;


--
-- Name: question_technology; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_technology (
    id integer NOT NULL,
    question_id integer NOT NULL,
    technology_id integer NOT NULL
);


ALTER TABLE public.question_technology OWNER TO postgres;

--
-- Name: question_technology_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_technology_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_technology_id_seq OWNER TO postgres;

--
-- Name: question_technology_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_technology_id_seq OWNED BY public.question_technology.id;


--
-- Name: technology; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.technology (
    id integer NOT NULL,
    name character varying(300)
);


ALTER TABLE public.technology OWNER TO postgres;

--
-- Name: technology_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.technology_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.technology_id_seq OWNER TO postgres;

--
-- Name: technology_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.technology_id_seq OWNED BY public.technology.id;


--
-- Name: test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test (
    id integer NOT NULL,
    title character varying(100),
    profession_id integer NOT NULL,
    chapter_id integer NOT NULL,
    technology_id integer,
    expertise_level public.expertise_level
);


ALTER TABLE public.test OWNER TO postgres;

--
-- Name: test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_id_seq OWNER TO postgres;

--
-- Name: test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_id_seq OWNED BY public.test.id;


--
-- Name: test_question; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_question (
    id integer NOT NULL,
    test_id integer NOT NULL,
    question_id integer NOT NULL,
    answer text,
    is_correct boolean,
    points integer
);


ALTER TABLE public.test_question OWNER TO postgres;

--
-- Name: test_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_question_id_seq OWNER TO postgres;

--
-- Name: test_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_question_id_seq OWNED BY public.test_question.id;


--
-- Name: user_test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_test (
    id integer NOT NULL,
    user_id integer NOT NULL,
    test_id integer NOT NULL,
    test_status public.test_status,
    score integer,
    started_at timestamp without time zone,
    completed_at timestamp without time zone
);


ALTER TABLE public.user_test OWNER TO postgres;

--
-- Name: user_test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_test_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_test_id_seq OWNER TO postgres;

--
-- Name: user_test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_test_id_seq OWNED BY public.user_test.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nickname character varying(100),
    email character varying(100),
    phone_number character varying(100) NOT NULL,
    password_hash character varying(200) NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    date_of_birth date,
    profession_id integer,
    expertise_level public.expertise_level
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: chapter id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter ALTER COLUMN id SET DEFAULT nextval('public.chapter_id_seq'::regclass);


--
-- Name: chapter_technology id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_technology ALTER COLUMN id SET DEFAULT nextval('public.chapter_technology_id_seq'::regclass);


--
-- Name: profession id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profession ALTER COLUMN id SET DEFAULT nextval('public.profession_id_seq'::regclass);


--
-- Name: interview_message id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_message ALTER COLUMN id SET DEFAULT nextval('public.interview_message_id_seq'::regclass);


--
-- Name: interview_session id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_session ALTER COLUMN id SET DEFAULT nextval('public.interview_session_id_seq'::regclass);


--
-- Name: profession_chapter id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profession_chapter ALTER COLUMN id SET DEFAULT nextval('public.profession_chapter_id_seq'::regclass);


--
-- Name: question id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question ALTER COLUMN id SET DEFAULT nextval('public.question_id_seq'::regclass);


--
-- Name: question_technology id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_technology ALTER COLUMN id SET DEFAULT nextval('public.question_technology_id_seq'::regclass);


--
-- Name: technology id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technology ALTER COLUMN id SET DEFAULT nextval('public.technology_id_seq'::regclass);


--
-- Name: test id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test ALTER COLUMN id SET DEFAULT nextval('public.test_id_seq'::regclass);


--
-- Name: test_question id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_question ALTER COLUMN id SET DEFAULT nextval('public.test_question_id_seq'::regclass);


--
-- Name: user_test id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_test ALTER COLUMN id SET DEFAULT nextval('public.user_test_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: interview_message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_message (id, interview_id, sequence_no, role, content, created_at) FROM stdin;
\.


--
-- Data for Name: interview_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_session (id, user_id, profession_id, interview_level, status, duration_minutes, profile_snapshot, prompt_version, llm_provider, llm_model, verdict_passed, summary, strengths, weaknesses, recommendations, started_at, expires_at, finished_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: chapter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chapter (id, name) FROM stdin;
3	Data bases
1	Programming Basics
2	Algorythms and data structures
4	Web development
5	Mobile Development
6	DevOps and infrastructure
7	Cyber Security
8	Testing
9	Architecture and patterns
10	Development tools
11	Operation systems
12	Networks and protocols
13	Machine Learning
14	Microservices
15	Containers
\.


--
-- Data for Name: chapter_technology; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chapter_technology (id, chapter_id, technology_id) FROM stdin;
1	1	1
2	1	2
3	1	7
4	1	8
5	1	9
6	1	10
7	1	11
8	1	12
9	1	13
10	2	1
11	2	2
12	2	7
13	2	8
14	2	9
15	2	10
16	3	21
17	3	22
18	3	23
19	3	24
20	3	25
21	4	1
22	4	2
23	4	3
24	4	4
25	4	5
26	4	6
27	4	7
28	4	11
29	4	12
30	4	29
31	4	30
32	5	14
33	5	15
34	5	42
35	5	43
36	5	44
37	5	45
38	6	16
39	6	17
40	6	18
41	6	19
42	6	20
43	6	26
44	6	27
45	6	28
46	7	7
47	7	8
48	7	11
49	7	12
50	8	46
51	8	47
52	8	48
53	8	49
54	8	50
55	9	8
56	9	11
57	9	36
58	9	37
59	9	38
60	9	39
61	9	40
62	10	26
63	10	27
64	10	28
65	11	27
66	12	29
67	12	30
68	13	7
69	13	31
70	13	32
71	13	33
72	13	34
73	13	35
74	14	6
75	14	8
76	14	11
77	14	36
78	14	37
79	15	16
80	15	17
\.


--
-- Data for Name: profession; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profession (id, name) FROM stdin;
1	Frontend Developer
2	Backend Developer
3	Fullstack Developer
4	DevOps Engineer
5	Data Scientist
6	Mobile Developer
7	QA Engineer
8	Security Engineer
9	Machine Learning Engineer
10	Cloud Engineer
\.


--
-- Data for Name: profession_chapter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profession_chapter (id, profession_id, chapter_id) FROM stdin;
1	1	1
2	1	2
3	1	4
4	1	8
5	1	10
6	2	1
7	2	2
8	2	3
9	2	4
10	2	9
11	2	11
12	2	12
13	3	1
14	3	2
15	3	3
16	3	4
17	3	8
18	3	9
19	3	10
20	4	3
21	4	6
22	4	11
23	4	12
24	4	15
25	5	1
26	5	2
27	5	3
28	5	13
29	6	1
30	6	2
31	6	5
32	6	8
33	7	1
34	7	8
35	7	10
36	8	7
37	8	11
38	8	12
39	9	1
40	9	2
41	9	13
42	10	3
43	10	6
44	10	11
45	10	12
46	10	15
\.


--
-- Data for Name: question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question (id, text, correct_answer, profession_id, chapter_id, technology_id, expertise_level) FROM stdin;
1	Что такое замыкание (closure) в JavaScript?	Функция вместе с лексическим окружением, в котором она была определена	1	1	1	junior
2	В чем разница между let, const и var?	var - function scope, let/const - block scope, const нельзя переопределить	1	1	1	junior
3	Что такое Promise в JavaScript?	Объект представляющий результат асинхронной операции	1	1	1	middle
4	Как работает event loop в JavaScript?	Механизм обработки асинхронных операций через call stack, callback queue и microtask queue	1	1	1	senior
5	Что такое hoisting в JavaScript?	Поднятие объявлений переменных и функций в начало области видимости	1	1	1	junior
6	В чем разница между React классом и функциональным компонентом?	Функциональные компоненты используют хуки, классы - методы жизненного цикла	1	4	3	middle
7	Что такое Virtual DOM?	Легковесная копия реального DOM для оптимизации обновлений	1	4	3	junior
8	Как работает useEffect?	Хук для side effects, принимает функцию и массив зависимостей	1	4	3	middle
9	Что такое React Context?	Механизм для передачи данных через дерево компонентов без пропсов	1	4	3	middle
10	Как оптимизировать производительность React приложения?	React.memo, useMemo, useCallback, код-сплиттинг	1	4	3	senior
11	Что такое event-driven architecture в Node.js?	Архитектура, где поток выполнения определяется событиями	2	4	6	middle
12	Как работает EventEmitter?	Класс для реализации паттерна наблюдатель в Node.js	2	4	6	middle
13	В чем разница между require и import?	require - CommonJS, import - ES6 modules	2	4	6	junior
14	Что такое поток (stream) в Node.js?	Абстракция для работы с данными, которые читаются/пишутся постепенно	2	4	6	senior
15	Как работает цикл событий в Node.js?	Однопоточный цикл, обрабатывающий асинхронные операции через фазы	2	4	6	senior
16	Что такое list comprehension?	Краткий способ создания списков	2	1	7	junior
17	В чем разница между списком и кортежем?	Список изменяемый, кортеж - нет	2	1	7	junior
18	Что такое декоратор в Python?	Функция, которая принимает другую функцию и расширяет её поведение	2	1	7	middle
19	Как работает GIL в Python?	Global Interpreter Lock - механизм, позволяющий выполнять только один поток Python за раз	2	1	7	senior
20	Что такое генераторы в Python?	Функции, которые возвращают итератор с yield	2	1	7	middle
21	В чем разница между INNER JOIN и LEFT JOIN?	INNER JOIN - только совпадающие строки, LEFT JOIN - все строки из левой таблицы	2	3	21	junior
22	Что такое нормализация базы данных?	Процесс организации данных для уменьшения избыточности	2	3	21	middle
23	Что такое транзакция в БД?	Последовательность операций, выполняемых как единое целое (ACID)	2	3	21	middle
24	Что такое индексы и зачем они нужны?	Структуры для ускорения поиска данных	2	3	21	junior
25	В чем разница между SQL и NoSQL?	SQL - реляционные, строгая схема; NoSQL - нереляционные, гибкая схема	2	3	21	middle
26	Что такое Big O notation?	Метод оценки сложности алгоритмов	1	2	\N	junior
27	В чем разница между массивом и связным списком?	Массив - непрерывная память, список - узлы с указателями	1	2	\N	junior
28	Как работает бинарный поиск?	Поиск в отсортированном массиве путем деления пополам	1	2	\N	middle
29	Что такое хэш-таблица?	Структура данных, реализующая ассоциативный массив	1	2	\N	middle
30	Как работает алгоритм быстрой сортировки?	Divide and conquer с выбором опорного элемента	1	2	\N	middle
31	Что такое Docker контейнер?	Изолированная среда для запуска приложения	4	15	16	junior
32	В чем разница между COPY и ADD в Dockerfile?	ADD поддерживает распаковку архивов и URL, COPY - только копирование файлов	4	15	16	middle
33	Что такое Docker volume?	Механизм для persistent data в контейнерах	4	15	16	middle
34	Как работает Docker network?	Механизм для связи между контейнерами	4	15	16	middle
35	Что такое multi-stage build в Docker?	Сборка в несколько этапов для уменьшения размера образа	4	15	16	senior
36	Что такое Pod в Kubernetes?	Наименьшая deployable unit, содержащая один или несколько контейнеров	4	15	17	middle
37	В чем разница между Deployment и StatefulSet?	Deployment для stateless, StatefulSet для stateful приложений	4	15	17	senior
38	Что такое Service в Kubernetes?	Абстракция для доступа к группе Pods	4	15	17	middle
39	Как работает Ingress?	API объект для управления внешним доступом к сервисам	4	15	17	senior
40	Что такое ConfigMap и Secret?	Способы хранения конфигурации и чувствительных данных	4	15	17	middle
41	Что такое goroutine?	Легковесный поток, управляемый Go runtime	2	1	9	junior
42	Как работает канал (channel) в Go?	Типизированный conduit для связи между goroutines	2	1	9	middle
43	В чем разница между буферизированным и небуферизированным каналом?	Буферизированный имеет емкость, небуферизированный - синхронный	2	1	9	middle
44	Что такое interface в Go?	Набор методов, определяющий поведение	2	1	9	junior
45	Как работает garbage collector в Go?	Concurrent mark-and-sweep сборщик мусора	2	1	9	senior
46	В чем разница между ArrayList и LinkedList?	ArrayList - массив, быстрый доступ; LinkedList - список, быстрая вставка/удаление	2	1	8	junior
47	Что такое JVM?	Java Virtual Machine - виртуальная машина для выполнения Java байт-кода	2	1	8	junior
48	Как работает garbage collection в Java?	Автоматическое освобождение памяти от неиспользуемых объектов	2	1	8	middle
49	Что такое Spring Framework?	Фреймворк для enterprise Java приложений	2	9	36	middle
50	В чем разница между @Autowired и @Resource?	@Autowired - Spring, по типу; @Resource - JSR-250, по имени	2	9	36	senior
51	Что такое overfitting?	Когда модель слишком хорошо обучается на тренировочных данных и плохо обобщает	9	13	31	junior
52	В чем разница между supervised и unsupervised learning?	Supervised - с метками, unsupervised - без меток	9	13	31	junior
53	Что такое gradient descent?	Алгоритм оптимизации для минимизации функции потерь	9	13	31	middle
54	Как работает нейронная сеть?	Сеть нейронов, передающих сигналы через взвешенные связи	9	13	31	middle
55	Что такое CNN?	Convolutional Neural Network - для обработки изображений	9	13	31	senior
56	В чем разница между unit test и integration test?	Unit test - один модуль, integration test - взаимодействие модулей	7	8	46	junior
57	Что такое TDD?	Test-Driven Development - разработка через тестирование	7	8	46	middle
58	Как работает Selenium?	Фреймворк для автоматизации веб-браузеров	7	8	46	middle
59	Что такое mock объекты?	Имитация реальных объектов для изоляции тестов	7	8	46	middle
60	В чем разница между stub и mock?	Stub - возвращает заранее определенные данные, mock - проверяет взаимодействия	7	8	46	senior
61	Что такое SQL injection?	Уязвимость, когда злоумышленник может выполнить произвольный SQL код	8	7	\N	junior
62	Как работает HTTPS?	HTTP поверх TLS/SSL для шифрования соединения	8	7	\N	middle
63	Что такое XSS attack?	Cross-site scripting - внедрение malicious scripts в веб-страницы	8	7	\N	middle
64	В чем разница между symmetric и asymmetric encryption?	Symmetric - один ключ, asymmetric - пара ключей (public/private)	8	7	\N	middle
65	Что такое OAuth 2.0?	Протокол авторизации для делегирования доступа	8	7	\N	senior
66	Что такое GraphQL?	Язык запросов для API, позволяющий клиенту запрашивать только нужные данные	2	4	29	middle
67	Как работает Redis?	In-memory data structure store, используемый как база данных, кэш и брокер сообщений	2	3	24	middle
68	Что такое microservices architecture?	Архитектурный стиль, где приложение состоит из небольших независимых сервисов	2	14	\N	senior
69	В чем разница между monolithic и microservices?	Monolithic - единое приложение, microservices - распределенная система	2	14	\N	middle
70	Что такое REST API?	Архитектурный стиль для веб-сервисов с использованием HTTP методов	2	4	30	junior
71	Что такое CSS Grid?	Система макета для двумерного размещения элементов	1	4	\N	junior
72	Как работает Flexbox?	Одномерная система макета для гибкого распределения пространства	1	4	\N	junior
73	Что такое Webpack?	Сборщик модулей для JavaScript приложений	1	10	1	middle
74	В чем разница между HTTP/1.1 и HTTP/2?	HTTP/2 multiplexing, header compression, server push	2	12	\N	senior
75	Что такое WebSocket?	Протокол для full-duplex связи через одно TCP соединение	2	12	\N	middle
76	Как работает JWT?	JSON Web Token - стандарт для создания access tokens	2	7	\N	middle
77	Что такое CI/CD?	Continuous Integration/Continuous Deployment - автоматизация сборки и развертывания	4	6	\N	middle
78	В чем разница между VM и контейнером?	VM - полная изоляция ОС, контейнер - изоляция процессов	4	15	16	junior
79	Что такое Terraform?	Infrastructure as Code tool для управления облачной инфраструктурой	4	6	18	senior
80	Как работает load balancer?	Распределение сетевого трафика между серверами	4	12	\N	middle
81	Что такое Apache Kafka?	Распределенная streaming платформа	2	14	\N	senior
82	В чем разница между SQL и NoSQL?	SQL - реляционные, ACID; NoSQL - нереляционные, BASE	2	3	\N	junior
83	Что такое Redis pub/sub?	Механизм публикации/подписки в Redis	2	3	24	middle
84	Как работает React Router?	Библиотека для маршрутизации в React приложениях	1	4	3	middle
85	Что такое Redux?	Predictable state container для JavaScript приложений	1	4	3	middle
86	В чем разница между state и props в React?	State - внутренние данные компонента, props - данные от родителя	1	4	3	junior
87	Что такое TypeScript generics?	Шаблоны для создания reusable компонентов	1	1	2	middle
88	Как работает async/await в JavaScript?	Синтаксический сахар для работы с Promise	1	1	1	middle
89	Что такое WebAssembly?	Бинарный формат для выполнения кода в браузере	1	4	\N	senior
90	В чем разница между cookies, localStorage и sessionStorage?	Cookies - серверные, localStorage - постоянное хранение, sessionStorage - сессионное	1	4	1	junior
\.


--
-- Data for Name: question_technology; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_technology (id, question_id, technology_id) FROM stdin;
1	29	1
2	29	2
3	30	24
4	31	16
5	31	17
6	32	16
7	32	17
8	33	1
9	33	2
10	33	7
11	33	8
\.


--
-- Data for Name: technology; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.technology (id, name) FROM stdin;
1	JavaScript
2	TypeScript
3	React
4	Vue.js
5	Angular
6	Node.js
7	Python
8	Java
9	Go
10	Rust
11	C#
12	PHP
13	Ruby
14	Swift
15	Kotlin
16	Docker
17	Kubernetes
18	AWS
19	Azure
20	GCP
21	PostgreSQL
22	MySQL
23	MongoDB
24	Redis
25	Elasticsearch
26	Git
27	Linux
28	Nginx
29	GraphQL
30	REST API
31	TensorFlow
32	PyTorch
33	Pandas
34	NumPy
35	Scikit-learn
36	Spring Boot
37	.NET
38	Django
39	Flask
40	Express.js
41	React Native
42	Flutter
43	Android
44	iOS
45	Xamarin
46	Selenium
47	Jest
48	Cypress
49	JUnit
50	PyTest
\.


--
-- Data for Name: test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test (id, title, profession_id, chapter_id, technology_id, expertise_level) FROM stdin;
1	JavaScript Fundamentals Test	1	1	1	junior
2	React Advanced Test	1	4	3	senior
3	Node.js Backend Test	2	4	6	middle
4	Python Programming Test	2	1	7	middle
5	Database Design Test	2	3	21	middle
6	Docker & Kubernetes Test	4	15	16	senior
7	Go Concurrency Test	2	1	9	senior
8	Java Spring Test	2	9	36	middle
9	Machine Learning Basics	9	13	31	junior
10	Security Fundamentals	8	7	\N	middle
11	React testing	1	4	3	junior
12	Test testing	2	3	21	junior
\.


--
-- Data for Name: test_question; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_question (id, test_id, question_id, answer, is_correct, points) FROM stdin;
1	1	1	\N	\N	\N
2	1	2	\N	\N	\N
3	1	3	\N	\N	\N
4	1	4	\N	\N	\N
5	1	5	\N	\N	\N
6	2	6	\N	\N	\N
7	2	7	\N	\N	\N
8	2	8	\N	\N	\N
9	2	9	\N	\N	\N
10	2	10	\N	\N	\N
11	3	11	\N	\N	\N
12	3	12	\N	\N	\N
13	3	13	\N	\N	\N
14	3	14	\N	\N	\N
15	3	15	\N	\N	\N
16	4	16	\N	\N	\N
17	4	17	\N	\N	\N
18	4	18	\N	\N	\N
19	4	19	\N	\N	\N
20	4	20	\N	\N	\N
21	5	21	\N	\N	\N
22	5	22	\N	\N	\N
23	5	23	\N	\N	\N
24	5	24	\N	\N	\N
25	5	25	\N	\N	\N
26	6	31	\N	\N	\N
27	6	32	\N	\N	\N
28	6	33	\N	\N	\N
29	6	34	\N	\N	\N
30	6	35	\N	\N	\N
31	6	36	\N	\N	\N
32	6	37	\N	\N	\N
33	6	38	\N	\N	\N
34	6	39	\N	\N	\N
35	7	41	\N	\N	\N
36	7	42	\N	\N	\N
37	7	43	\N	\N	\N
38	7	44	\N	\N	\N
39	7	45	\N	\N	\N
40	8	46	\N	\N	\N
41	8	47	\N	\N	\N
42	8	48	\N	\N	\N
43	8	49	\N	\N	\N
44	8	50	\N	\N	\N
45	9	51	\N	\N	\N
46	9	52	\N	\N	\N
47	9	53	\N	\N	\N
48	9	54	\N	\N	\N
49	9	55	\N	\N	\N
50	10	56	\N	\N	\N
51	10	57	\N	\N	\N
52	10	58	\N	\N	\N
53	10	59	\N	\N	\N
54	10	60	\N	\N	\N
55	1	66	\N	\N	\N
56	1	67	\N	\N	\N
57	1	78	\N	\N	\N
58	1	80	\N	\N	\N
59	2	74	\N	\N	\N
60	2	75	\N	\N	\N
61	3	69	\N	\N	\N
62	3	70	\N	\N	\N
63	6	68	\N	\N	\N
64	6	71	\N	\N	\N
66	11	7	\N	\N	\N
67	11	85	\N	\N	\N
65	11	8	Хук для side effects, принимает функцию и массив зависимостей	t	1
69	12	24	\N	\N	\N
68	12	21	Хук для side effects, принимает функцию и массив зависимостей	f	0
\.


--
-- Data for Name: user_test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_test (id, user_id, test_id, test_status, score, started_at, completed_at) FROM stdin;
1	2	1	completed	85	2024-01-15 10:00:00	2024-01-15 11:30:00
2	2	3	completed	92	2024-01-20 14:00:00	2024-01-20 15:45:00
3	3	9	completed	78	2024-01-18 09:30:00	2024-01-18 10:45:00
4	4	6	in_progress	\N	2024-01-22 16:00:00	\N
5	5	1	completed	65	2024-01-17 13:00:00	2024-01-17 14:20:00
6	2	5	assigned	\N	\N	\N
7	3	10	completed	88	2024-01-19 11:00:00	2024-01-19 12:15:00
8	6	11	completed	1	2026-02-23 22:09:00	2026-02-23 22:35:04
9	6	12	completed	0	2026-02-23 22:36:58	2026-02-23 22:37:10
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nickname, email, phone_number, password_hash, is_admin, date_of_birth, profession_id, expertise_level) FROM stdin;
1	admin	admin@sobeslife.com	+79990000001	admin_hash_123	t	1990-01-01	1	senior
2	ivan_dev	ivan@mail.com	+79990000002	user_hash_456	f	1995-05-15	2	middle
3	maria_qa	maria@mail.com	+79990000003	user_hash_789	f	1992-08-20	7	junior
4	alex_ml	alex@mail.com	+79990000004	user_hash_101	f	1988-12-10	9	senior
5	sasha_front	sasha@mail.com	+79990000005	user_hash_102	f	1998-03-25	1	trainee
6	Paveq_p	paveq2003@yandex.ru	89052571777	$2a$10$RJuHYBDyu3llbVlmXh0TB.ZWFSbuOIVY8ef1Ny77/1AcZwEzSrZm6	f	\N	\N	\N
\.


--
-- Name: chapter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chapter_id_seq', 15, true);


--
-- Name: chapter_technology_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chapter_technology_id_seq', 80, true);


--
-- Name: profession_chapter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profession_chapter_id_seq', 46, true);


--
-- Name: profession_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profession_id_seq', 10, true);


--
-- Name: interview_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interview_message_id_seq', 1, false);


--
-- Name: interview_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interview_session_id_seq', 1, false);


--
-- Name: question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_id_seq', 90, true);


--
-- Name: question_technology_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_technology_id_seq', 11, true);


--
-- Name: technology_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.technology_id_seq', 50, true);


--
-- Name: test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_id_seq', 12, true);


--
-- Name: test_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_question_id_seq', 69, true);


--
-- Name: user_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_test_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: chapter chapter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter
    ADD CONSTRAINT chapter_pkey PRIMARY KEY (id);


--
-- Name: chapter_technology chapter_technology_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_technology
    ADD CONSTRAINT chapter_technology_pkey PRIMARY KEY (id);


--
-- Name: profession_chapter profession_chapter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profession_chapter
    ADD CONSTRAINT profession_chapter_pkey PRIMARY KEY (id);


--
-- Name: profession profession_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profession
    ADD CONSTRAINT profession_pkey PRIMARY KEY (id);


--
-- Name: interview_message interview_message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_message
    ADD CONSTRAINT interview_message_pkey PRIMARY KEY (id);


--
-- Name: interview_message interview_message_interview_id_sequence_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_message
    ADD CONSTRAINT interview_message_interview_id_sequence_no_key UNIQUE (interview_id, sequence_no);


--
-- Name: interview_session interview_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_session
    ADD CONSTRAINT interview_session_pkey PRIMARY KEY (id);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);


--
-- Name: question_technology question_technology_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_technology
    ADD CONSTRAINT question_technology_pkey PRIMARY KEY (id);


--
-- Name: technology technology_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.technology
    ADD CONSTRAINT technology_pkey PRIMARY KEY (id);


--
-- Name: test test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_pkey PRIMARY KEY (id);


--
-- Name: test_question test_question_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_question
    ADD CONSTRAINT test_question_pkey PRIMARY KEY (id);


--
-- Name: user_test user_test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_test
    ADD CONSTRAINT user_test_pkey PRIMARY KEY (id);


--
-- Name: users users_password_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_password_hash_key UNIQUE (password_hash);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_interview_message_interview_sequence; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interview_message_interview_sequence ON public.interview_message USING btree (interview_id, sequence_no);


--
-- Name: idx_interview_session_one_in_progress_per_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_interview_session_one_in_progress_per_user ON public.interview_session USING btree (user_id) WHERE (status = 'in_progress'::public.interview_status);


--
-- Name: idx_interview_session_status_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interview_session_status_expires_at ON public.interview_session USING btree (status, expires_at);


--
-- Name: idx_interview_session_user_started_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interview_session_user_started_at ON public.interview_session USING btree (user_id, started_at DESC);


--
-- Name: chapter_technology chapter_technology_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_technology
    ADD CONSTRAINT chapter_technology_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapter(id) ON DELETE CASCADE;


--
-- Name: chapter_technology chapter_technology_technology_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_technology
    ADD CONSTRAINT chapter_technology_technology_id_fkey FOREIGN KEY (technology_id) REFERENCES public.technology(id) ON DELETE CASCADE;


--
-- Name: profession_chapter profession_chapter_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profession_chapter
    ADD CONSTRAINT profession_chapter_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapter(id) ON DELETE CASCADE;


--
-- Name: profession_chapter profession_chapter_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profession_chapter
    ADD CONSTRAINT profession_chapter_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.profession(id) ON DELETE CASCADE;


--
-- Name: interview_message interview_message_interview_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_message
    ADD CONSTRAINT interview_message_interview_id_fkey FOREIGN KEY (interview_id) REFERENCES public.interview_session(id) ON DELETE CASCADE;


--
-- Name: interview_session interview_session_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_session
    ADD CONSTRAINT interview_session_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.profession(id) ON DELETE RESTRICT;


--
-- Name: interview_session interview_session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_session
    ADD CONSTRAINT interview_session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: question question_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapter(id) ON DELETE CASCADE;


--
-- Name: question question_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.profession(id) ON DELETE CASCADE;


--
-- Name: question question_technology_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_technology_id_fkey FOREIGN KEY (technology_id) REFERENCES public.technology(id) ON DELETE CASCADE;


--
-- Name: question_technology question_technology_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_technology
    ADD CONSTRAINT question_technology_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id) ON DELETE CASCADE;


--
-- Name: question_technology question_technology_technology_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_technology
    ADD CONSTRAINT question_technology_technology_id_fkey FOREIGN KEY (technology_id) REFERENCES public.technology(id) ON DELETE CASCADE;


--
-- Name: test test_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapter(id) ON DELETE CASCADE;


--
-- Name: test test_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.profession(id) ON DELETE CASCADE;


--
-- Name: test_question test_question_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_question
    ADD CONSTRAINT test_question_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id) ON DELETE CASCADE;


--
-- Name: test_question test_question_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_question
    ADD CONSTRAINT test_question_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.test(id) ON DELETE CASCADE;


--
-- Name: test test_technology_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test
    ADD CONSTRAINT test_technology_id_fkey FOREIGN KEY (technology_id) REFERENCES public.technology(id) ON DELETE CASCADE;


--
-- Name: user_test user_test_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_test
    ADD CONSTRAINT user_test_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.test(id) ON DELETE CASCADE;


--
-- Name: user_test user_test_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_test
    ADD CONSTRAINT user_test_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_profession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_profession_id_fkey FOREIGN KEY (profession_id) REFERENCES public.profession(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

