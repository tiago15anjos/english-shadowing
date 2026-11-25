// Lessons for the shadowing app.
// Structure follows the "English Wisdom" style: verbs & grammar -> vocabulary ->
// idiomatic expressions -> sentences that mix everything, harder each lesson.
// All sentences here are original. Add new lessons by copying one block.
//
// Item fields:
//   en      sentence to shadow (required)
//   pt      translation (optional)
//   word    key word/expression of the item (vocabulary/idioms) -> used by flashcards
//   wordPt  meaning of the key word in Portuguese

window.LESSONS = [
  {
    id: "l1",
    number: 1,
    title: "Present Continuous",
    subtitle: "O que estou fazendo agora: am / is / are + -ing",
    grammarPt:
      "Usamos am / is / are + verbo com -ing para ações acontecendo agora ou neste período. " +
      "Não esqueça o verbo to be: \"I'm building\", e nunca \"I building\". " +
      "Na fala, use a contração: I'm, you're, she's, we're, they're.",
    verbs: [
      { forms: "to build, built, built", pt: "construir" },
      { forms: "to try, tried, tried", pt: "tentar" },
      { forms: "to improve, improved, improved", pt: "melhorar" },
      { forms: "to practice, practiced, practiced", pt: "praticar" },
    ],
    sections: [
      {
        key: "verbs",
        title: "Verbs & Grammar",
        items: [
          { en: "I'm building an app to practice my English.", pt: "Estou construindo um app para praticar meu inglês." },
          { en: "She is trying to call her host.", pt: "Ela está tentando ligar para a anfitriã dela." },
          { en: "We are improving a little every day.", pt: "Estamos melhorando um pouco a cada dia." },
          { en: "Are you practicing your pronunciation right now?", pt: "Você está praticando sua pronúncia agora?" },
          { en: "I'm not working today. I'm studying at home.", pt: "Não estou trabalhando hoje. Estou estudando em casa." },
          { en: "What are you reading these days?", pt: "O que você está lendo esses dias?" },
          { en: "They're waiting for the bus outside.", pt: "Eles estão esperando o ônibus lá fora." },
          { en: "He's living in Toronto this year.", pt: "Ele está morando em Toronto este ano." },
        ],
      },
      {
        key: "vocab",
        title: "Vocabulary",
        items: [
          { en: "Speaking is the skill I want to improve the most.", pt: "Falar é a habilidade que eu mais quero melhorar.", word: "skill", wordPt: "habilidade" },
          { en: "I'm a little shy when I meet new people.", pt: "Sou um pouco tímido quando conheço pessoas novas.", word: "shy", wordPt: "tímido" },
          { en: "My English school is downtown, near the subway.", pt: "Minha escola de inglês fica no centro, perto do metrô.", word: "downtown", wordPt: "centro da cidade" },
          { en: "I take the subway every morning.", pt: "Eu pego o metrô toda manhã.", word: "subway", wordPt: "metrô" },
          { en: "This neighborhood is quiet and safe.", pt: "Este bairro é tranquilo e seguro.", word: "neighborhood", wordPt: "bairro, vizinhança" },
        ],
      },
      {
        key: "idioms",
        title: "Idiomatic Expressions",
        items: [
          { en: "Little by little, I'm getting better at speaking.", pt: "Pouco a pouco, estou ficando melhor em falar.", word: "little by little", wordPt: "pouco a pouco" },
          { en: "Don't worry, I'm on my way.", pt: "Não se preocupe, estou a caminho.", word: "on my way", wordPt: "a caminho" },
          { en: "It's hard, but I'm going to keep going.", pt: "É difícil, mas vou continuar.", word: "keep going", wordPt: "continuar, seguir em frente" },
        ],
      },
      {
        key: "mixed",
        title: "Putting It Together",
        items: [
          { en: "I'm trying to speak more, even when I feel shy.", pt: "Estou tentando falar mais, mesmo quando me sinto tímido." },
          { en: "Right now I'm on my way downtown to meet a friend.", pt: "Agora estou indo para o centro encontrar um amigo." },
          { en: "My English is improving little by little, and I'm proud of it.", pt: "Meu inglês está melhorando pouco a pouco, e tenho orgulho disso." },
          { en: "This month I'm practicing a new skill: speaking without fear.", pt: "Este mês estou praticando uma nova habilidade: falar sem medo." },
        ],
      },
    ],
  },

  {
    id: "l2",
    number: 2,
    title: "Simple Past",
    subtitle: "Contando histórias: -ed, verbos irregulares, did / didn't",
    grammarPt:
      "Verbos regulares ganham -ed (arrive → arrived). Os irregulares mudam de forma (get → got, give → gave). " +
      "Na negativa e na pergunta usamos did / didn't com o verbo na forma normal: " +
      "\"I didn't know\" (e não \"I didn't knew\"), \"Did you understand?\".",
    verbs: [
      { forms: "to arrive, arrived, arrived", pt: "chegar" },
      { forms: "to get, got, gotten", pt: "conseguir, obter, pegar" },
      { forms: "to give, gave, given", pt: "dar, entregar" },
      { forms: "to forget, forgot, forgotten", pt: "esquecer" },
    ],
    sections: [
      {
        key: "verbs",
        title: "Verbs & Grammar",
        items: [
          { en: "I arrived in Toronto on a Friday.", pt: "Eu cheguei em Toronto numa sexta-feira." },
          { en: "I got my bank account on the same day.", pt: "Consegui minha conta no banco no mesmo dia." },
          { en: "She gave me a map of the city.", pt: "Ela me deu um mapa da cidade." },
          { en: "I forgot the name of my first school.", pt: "Esqueci o nome da minha primeira escola." },
          { en: "I didn't know anything about English.", pt: "Eu não sabia nada de inglês." },
          { en: "Did you understand what he said?", pt: "Você entendeu o que ele disse?" },
          { en: "We didn't have time to eat lunch.", pt: "Não tivemos tempo de almoçar." },
          { en: "Where did you go last weekend?", pt: "Aonde você foi no último fim de semana?" },
        ],
      },
      {
        key: "vocab",
        title: "Vocabulary",
        items: [
          { en: "The bank teller was very kind to me.", pt: "O caixa do banco foi muito gentil comigo.", word: "bank teller", wordPt: "caixa de banco" },
          { en: "He asked me for my address.", pt: "Ele me pediu meu endereço.", word: "address", wordPt: "endereço" },
          { en: "My host picked me up at the airport.", pt: "Minha anfitriã me buscou no aeroporto.", word: "host", wordPt: "anfitrião, anfitriã" },
          { en: "Don't forget to bring your passport.", pt: "Não esqueça de trazer seu passaporte.", word: "passport", wordPt: "passaporte" },
          { en: "Last weekend I visited a museum.", pt: "No último fim de semana visitei um museu.", word: "weekend", wordPt: "fim de semana" },
        ],
      },
      {
        key: "idioms",
        title: "Idiomatic Expressions",
        items: [
          { en: "The first test was a piece of cake.", pt: "A primeira prova foi moleza.", word: "a piece of cake", wordPt: "moleza, muito fácil" },
          { en: "I finally figured out how the subway works.", pt: "Finalmente entendi como o metrô funciona.", word: "figure out", wordPt: "descobrir, entender" },
          { en: "I got to class on time, for once.", pt: "Cheguei na aula no horário, pela primeira vez.", word: "on time", wordPt: "no horário, pontualmente" },
        ],
      },
      {
        key: "mixed",
        title: "Putting It Together",
        items: [
          { en: "On my second day, I needed to open a bank account.", pt: "No meu segundo dia, eu precisei abrir uma conta no banco." },
          { en: "I didn't have the address, so I had to call my host.", pt: "Eu não tinha o endereço, então tive que ligar para minha anfitriã." },
          { en: "The bank teller was patient, and in the end everything went well.", pt: "O caixa foi paciente, e no final deu tudo certo." },
          { en: "I figured out the subway on my first weekend, but I got lost twice.", pt: "Entendi o metrô no meu primeiro fim de semana, mas me perdi duas vezes." },
        ],
      },
    ],
  },

  {
    id: "l3",
    number: 3,
    title: "TO or FOR?",
    subtitle: "explain to him, give it to her, wait for, look for",
    grammarPt:
      "Em português dizemos \"explicar para ele\", mas em inglês é \"explain TO him\". " +
      "Use TO quando a ação vai em direção a alguém: explain to, give to, talk to, say to, send to. " +
      "Use FOR para propósito, benefício ou duração: wait for, look for, ask for, a gift for you, for two years.",
    verbs: [
      { forms: "to explain (to), explained, explained", pt: "explicar (para alguém)" },
      { forms: "to talk (to), talked, talked", pt: "conversar (com alguém)" },
      { forms: "to wait (for), waited, waited", pt: "esperar (por)" },
      { forms: "to look (for), looked, looked", pt: "procurar" },
    ],
    sections: [
      {
        key: "verbs",
        title: "Verbs & Grammar",
        items: [
          { en: "I tried to explain to him that I needed help.", pt: "Tentei explicar para ele que eu precisava de ajuda." },
          { en: "Can I talk to the manager, please?", pt: "Posso falar com o gerente, por favor?" },
          { en: "I'm waiting for my friend at the station.", pt: "Estou esperando meu amigo na estação." },
          { en: "She is looking for a new apartment.", pt: "Ela está procurando um apartamento novo." },
          { en: "I gave it to him yesterday.", pt: "Eu dei isso para ele ontem." },
          { en: "This gift is for you.", pt: "Este presente é para você." },
          { en: "Please send the file to me by email.", pt: "Por favor, me mande o arquivo por e-mail." },
          { en: "I studied there for nine months.", pt: "Estudei lá por nove meses." },
        ],
      },
      {
        key: "vocab",
        title: "Vocabulary",
        items: [
          { en: "Can I have the receipt, please?", pt: "Pode me dar o recibo, por favor?", word: "receipt", wordPt: "recibo, nota fiscal" },
          { en: "The manager explained the rules to us.", pt: "O gerente nos explicou as regras.", word: "manager", wordPt: "gerente" },
          { en: "I have an appointment at three o'clock.", pt: "Tenho um horário marcado às três.", word: "appointment", wordPt: "consulta, horário marcado" },
          { en: "I sent my chapter to my advisor last night.", pt: "Mandei meu capítulo para meu orientador ontem à noite.", word: "advisor", wordPt: "orientador" },
          { en: "We waited in line for twenty minutes.", pt: "Esperamos na fila por vinte minutos.", word: "line", wordPt: "fila" },
        ],
      },
      {
        key: "idioms",
        title: "Idiomatic Expressions",
        items: [
          { en: "I'm looking forward to seeing you again.", pt: "Estou ansioso para te ver de novo.", word: "look forward to", wordPt: "aguardar ansiosamente (algo bom)" },
          { en: "It's okay to ask for help.", pt: "Tudo bem pedir ajuda.", word: "ask for help", wordPt: "pedir ajuda" },
          { en: "Are you moving to Canada for good?", pt: "Você vai se mudar para o Canadá de vez?", word: "for good", wordPt: "de vez, para sempre" },
        ],
      },
      {
        key: "mixed",
        title: "Putting It Together",
        items: [
          { en: "I explained to the manager that I was waiting for my receipt.", pt: "Expliquei ao gerente que eu estava esperando meu recibo." },
          { en: "I sent the email to my advisor and asked for an appointment.", pt: "Mandei o e-mail para meu orientador e pedi um horário." },
          { en: "We waited in line for an hour, but it was worth it.", pt: "Esperamos na fila por uma hora, mas valeu a pena." },
          { en: "I'm looking forward to talking to native speakers every day.", pt: "Estou ansioso para conversar com falantes nativos todos os dias." },
        ],
      },
    ],
  },

  {
    id: "l4",
    number: 4,
    title: "Comparatives & Superlatives",
    subtitle: "colder than, more expensive than, the best",
    grammarPt:
      "Adjetivos curtos ganham -er / -est: cold → colder → the coldest. " +
      "Adjetivos longos usam more / the most: expensive → more expensive → the most expensive. " +
      "Irregulares: good → better → the best; bad → worse → the worst. Depois do comparativo vem \"than\".",
    verbs: [
      { forms: "to compare, compared, compared", pt: "comparar" },
      { forms: "to prefer, preferred, preferred", pt: "preferir" },
      { forms: "to choose, chose, chosen", pt: "escolher" },
      { forms: "to spend, spent, spent", pt: "gastar; passar (tempo)" },
    ],
    sections: [
      {
        key: "verbs",
        title: "Verbs & Grammar",
        items: [
          { en: "Don't compare yourself to other students.", pt: "Não se compare com outros alunos." },
          { en: "I prefer tea to coffee in the afternoon.", pt: "Prefiro chá a café à tarde." },
          { en: "She chose the cheapest room in the hotel.", pt: "Ela escolheu o quarto mais barato do hotel." },
          { en: "We spent the best year of our lives in Canada.", pt: "Passamos o melhor ano das nossas vidas no Canadá." },
          { en: "Winter in Toronto is colder than winter in Brazil.", pt: "O inverno em Toronto é mais frio que o inverno no Brasil." },
          { en: "For me, speaking is harder than listening.", pt: "Para mim, falar é mais difícil do que ouvir." },
          { en: "This is the most interesting book I've ever read.", pt: "Este é o livro mais interessante que já li." },
          { en: "My pronunciation is better than it was last year.", pt: "Minha pronúncia está melhor do que estava no ano passado." },
        ],
      },
      {
        key: "vocab",
        title: "Vocabulary",
        items: [
          { en: "The weather changes very quickly here.", pt: "O tempo muda muito rápido aqui.", word: "weather", wordPt: "tempo, clima" },
          { en: "Food is cheap here, but rent is expensive.", pt: "A comida é barata aqui, mas o aluguel é caro.", word: "cheap", wordPt: "barato" },
          { en: "The subway is more crowded in the morning.", pt: "O metrô fica mais lotado de manhã.", word: "crowded", wordPt: "lotado, cheio" },
          { en: "Moving abroad was the biggest challenge of my life.", pt: "Mudar para o exterior foi o maior desafio da minha vida.", word: "challenge", wordPt: "desafio" },
          { en: "Rent is the highest cost for most students.", pt: "O aluguel é o maior custo para a maioria dos estudantes.", word: "rent", wordPt: "aluguel" },
        ],
      },
      {
        key: "idioms",
        title: "Idiomatic Expressions",
        items: [
          { en: "Send me your answer. The sooner, the better.", pt: "Me mande sua resposta. Quanto antes, melhor.", word: "the sooner, the better", wordPt: "quanto antes, melhor" },
          { en: "You finally called me. Better late than never!", pt: "Você finalmente me ligou. Antes tarde do que nunca!", word: "better late than never", wordPt: "antes tarde do que nunca" },
          { en: "I understand more or less everything now.", pt: "Agora eu entendo mais ou menos tudo.", word: "more or less", wordPt: "mais ou menos" },
        ],
      },
      {
        key: "mixed",
        title: "Putting It Together",
        items: [
          { en: "Living abroad was harder than I expected, but it was the best experience of my life.", pt: "Morar fora foi mais difícil do que eu esperava, mas foi a melhor experiência da minha vida." },
          { en: "The sooner you start speaking, the better your pronunciation will be.", pt: "Quanto antes você começar a falar, melhor será sua pronúncia." },
          { en: "Downtown is more crowded and more expensive, but it's closer to everything.", pt: "O centro é mais lotado e mais caro, mas é mais perto de tudo." },
          { en: "I'm speaking more slowly now, but my sentences are clearer than before.", pt: "Estou falando mais devagar agora, mas minhas frases estão mais claras do que antes." },
        ],
      },
    ],
  },

  {
    id: "l5",
    number: 5,
    title: "Present Perfect",
    subtitle: "I have lived, have you ever…?, for / since, already / yet",
    grammarPt:
      "have / has + particípio fala de experiências (\"Have you ever seen snow?\") ou de algo que começou " +
      "no passado e continua (\"I have lived here for nine months\"). " +
      "FOR = duração (for a year); SINCE = ponto de partida (since 2024). " +
      "Já = already (afirmativa), yet (negativa e pergunta).",
    verbs: [
      { forms: "to be, was / were, been", pt: "ser, estar; ir (have been to)" },
      { forms: "to live, lived, lived", pt: "morar, viver" },
      { forms: "to see, saw, seen", pt: "ver" },
      { forms: "to learn, learned, learned", pt: "aprender" },
    ],
    sections: [
      {
        key: "verbs",
        title: "Verbs & Grammar",
        items: [
          { en: "I have been to Toronto twice.", pt: "Já fui a Toronto duas vezes." },
          { en: "She has lived in Canada since 2024.", pt: "Ela mora no Canadá desde 2024." },
          { en: "Have you ever seen snow?", pt: "Você já viu neve?" },
          { en: "I have learned a lot this year.", pt: "Aprendi muito este ano." },
          { en: "I have studied English for one year.", pt: "Estudo inglês há um ano." },
          { en: "We haven't finished the project yet.", pt: "Ainda não terminamos o projeto." },
          { en: "Has he already left?", pt: "Ele já foi embora?" },
          { en: "I've just arrived home.", pt: "Acabei de chegar em casa." },
        ],
      },
      {
        key: "vocab",
        title: "Vocabulary",
        items: [
          { en: "Have you ever lived abroad?", pt: "Você já morou no exterior?", word: "abroad", wordPt: "no exterior, fora do país" },
          { en: "I want to become fluent in two years.", pt: "Quero ficar fluente em dois anos.", word: "fluent", wordPt: "fluente" },
          { en: "I've made the same mistake many times.", pt: "Já cometi o mesmo erro muitas vezes.", word: "mistake", wordPt: "erro" },
          { en: "She has received a scholarship to study in Canada.", pt: "Ela recebeu uma bolsa para estudar no Canadá.", word: "scholarship", wordPt: "bolsa de estudos" },
          { en: "My research is about public policy.", pt: "Minha pesquisa é sobre políticas públicas.", word: "research", wordPt: "pesquisa" },
        ],
      },
      {
        key: "idioms",
        title: "Idiomatic Expressions",
        items: [
          { en: "How is the new job? So far, so good.", pt: "Como está o emprego novo? Até agora, tudo bem.", word: "so far", wordPt: "até agora" },
          { en: "I have made a lot of progress this month.", pt: "Fiz muito progresso este mês.", word: "make progress", wordPt: "fazer progresso, avançar" },
          { en: "Once in a while, I watch a movie without subtitles.", pt: "De vez em quando, assisto a um filme sem legendas.", word: "once in a while", wordPt: "de vez em quando" },
        ],
      },
      {
        key: "mixed",
        title: "Putting It Together",
        items: [
          { en: "I've lived abroad for nine months, and so far it has been amazing.", pt: "Moro no exterior há nove meses e, até agora, tem sido incrível." },
          { en: "Have you ever made a mistake that taught you something important?", pt: "Você já cometeu um erro que te ensinou algo importante?" },
          { en: "I have made a lot of progress, but I haven't become fluent yet.", pt: "Fiz muito progresso, mas ainda não fiquei fluente." },
          { en: "I've been working on my research about scholarship programs for a long time.", pt: "Estou trabalhando na minha pesquisa sobre programas de bolsas há muito tempo." },
        ],
      },
    ],
  },

  {
    id: "l6",
    number: 6,
    title: "Modals & False Friends",
    subtitle: "could, should, have to, would like + armadilhas do português",
    grammarPt:
      "Modais vêm antes do verbo sem \"to\": \"You should practice\" (e não \"should to practice\"). " +
      "Could you…? é o jeito educado de pedir. Cuidado com os falsos cognatos: " +
      "actually = na verdade (não \"atualmente\" → currently); realize = perceber; pretend = fingir; " +
      "eventually = no fim, com o tempo; parents = pais (não parentes); pedir algo = ask for (não \"solicit\").",
    verbs: [
      { forms: "can, could", pt: "poder, conseguir" },
      { forms: "should", pt: "deveria" },
      { forms: "to have to, had to, had to", pt: "ter que" },
      { forms: "would like", pt: "gostaria" },
    ],
    sections: [
      {
        key: "verbs",
        title: "Verbs & Grammar",
        items: [
          { en: "Could you speak a little more slowly, please?", pt: "Você poderia falar um pouco mais devagar, por favor?" },
          { en: "You should practice out loud every day.", pt: "Você deveria praticar em voz alta todo dia." },
          { en: "I have to finish this chapter by Friday.", pt: "Tenho que terminar este capítulo até sexta." },
          { en: "I would like a medium coffee, please.", pt: "Eu gostaria de um café médio, por favor." },
          { en: "Actually, I'm Brazilian, not Portuguese.", pt: "Na verdade, sou brasileiro, não português." },
          { en: "I didn't realize it was so late.", pt: "Não percebi que estava tão tarde." },
          { en: "He pretended he didn't see me.", pt: "Ele fingiu que não me viu." },
          { en: "I asked the teacher for more examples.", pt: "Pedi mais exemplos ao professor." },
        ],
      },
      {
        key: "vocab",
        title: "Vocabulary",
        items: [
          { en: "I'm currently writing my thesis.", pt: "Atualmente estou escrevendo minha tese.", word: "currently", wordPt: "atualmente" },
          { en: "I study at the library on weekends.", pt: "Estudo na biblioteca nos fins de semana.", word: "library", wordPt: "biblioteca" },
          { en: "Eventually, I got used to the cold.", pt: "Com o tempo, me acostumei com o frio.", word: "eventually", wordPt: "no fim, com o tempo" },
          { en: "My parents live in Brazil.", pt: "Meus pais moram no Brasil.", word: "parents", wordPt: "pais (pai e mãe)" },
          { en: "Pull the door, don't push it.", pt: "Puxe a porta, não empurre.", word: "pull", wordPt: "puxar (push = empurrar)" },
        ],
      },
      {
        key: "idioms",
        title: "Idiomatic Expressions",
        items: [
          { en: "It took me months to get used to the winter.", pt: "Levei meses para me acostumar com o inverno.", word: "get used to", wordPt: "acostumar-se com" },
          { en: "Now your explanation makes sense.", pt: "Agora sua explicação faz sentido.", word: "make sense", wordPt: "fazer sentido" },
          { en: "Pizza or sushi? It's up to you.", pt: "Pizza ou sushi? Você que sabe.", word: "it's up to you", wordPt: "você decide, você que sabe" },
        ],
      },
      {
        key: "mixed",
        title: "Putting It Together",
        items: [
          { en: "Actually, I would like to ask you for a favor, if that's okay.", pt: "Na verdade, eu gostaria de te pedir um favor, se não tiver problema." },
          { en: "I'm currently at the library, so I have to speak quietly.", pt: "Estou na biblioteca agora, então tenho que falar baixo." },
          { en: "Eventually I got used to the weather, but I still miss my parents.", pt: "Com o tempo me acostumei com o clima, mas ainda sinto falta dos meus pais." },
          { en: "Could you explain it to me again? It doesn't make sense to me yet.", pt: "Você poderia me explicar de novo? Ainda não faz sentido para mim." },
        ],
      },
    ],
  },
];
