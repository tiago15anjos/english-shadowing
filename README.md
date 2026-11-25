# English Shadowing

App simples para treinar a fala e a pronúncia em inglês com a técnica de **shadowing**:
ouvir uma frase, repetir em voz alta e ver na hora quais palavras saíram certas.

Funciona no **Google Chrome no computador** (o reconhecimento de voz grátis do navegador só funciona bem no Chrome).

## O que tem

- **Shadowing**: uma frase por vez, com áudio normal ou devagar. Você grava, o app transcreve a sua voz,
  compara com a frase e pinta as palavras: verde (certo), amarelo (meio certo, ex.: "I building" em vez de "I'm building"),
  vermelho (faltou ou saiu diferente). Dá para ouvir a sua gravação e comparar com o modelo.
- **Lições** no estilo do livro *English Wisdom*: Verbs & Grammar → Vocabulary → Idiomatic Expressions →
  Putting It Together, cada lição um pouco mais difícil. As frases são novas, escritas para o app.
  Em **Minhas frases** você adiciona as suas.
- **Flashcards**: inglês na frente, português atrás, com revisão espaçada (o que você erra volta mais cedo).
  As palavras que você erra no shadowing vão para os cartões automaticamente, e você pode clicar em qualquer palavra da frase para salvá-la.
- **Meu Progresso**: média por dia, dias seguidos, frases dominadas e o ranking das palavras que você mais erra.
- **Lições do livro (particular)**: em *Configurações → Lições do livro*, importe o arquivo `.json` com as lições.
  Ele fica salvo só no seu navegador; o conteúdo do livro nunca vai para este repositório.
- **Dois jeitos de avaliar a fala** (em *Configurações*):
  - **Chrome (grátis)** com **modo rigoroso**: usa o primeiro palpite do reconhecimento, sem escolher a versão que mais parece com a frase certa,
    e mostra a "certeza" do Chrome. Atenção: o reconhecimento do Chrome sempre tenta adivinhar palavras reais, então ele nunca mostra exatamente o som que você fez.
  - **Microsoft Pronunciation Assessment** (cota grátis de 5 h/mês): nota para cada **som (fonema)**, fluência, completude e entonação.
    Mostra, por exemplo, que o /θ/ de *think* soou como /f/. Precisa de uma chave do Azure Speech (veja abaixo).
- **Voz da ElevenLabs** (opcional): cole a sua chave em Configurações. Cada frase é gerada uma vez só e fica guardada,
  então ouvir de novo (inclusive devagar) não gasta créditos. Sem chave, o app usa a voz do navegador.

Tudo fica salvo **no seu navegador** (nada vai para servidor nenhum). Use *Configurações → Exportar progresso* de vez em quando como backup.

## Como abrir

### Opção 1: GitHub Pages (recomendado, abre de qualquer computador)

1. No GitHub, abra o repositório e vá em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**, depois a branch **main** e a pasta **/ (root)**. Clique em **Save**.
3. Espere 1 ou 2 minutos. O endereço aparece no topo da página, algo como
   `https://tiago15anjos.github.io/english-shadowing/`.
4. Abra no Chrome e, na primeira gravação, clique em **Permitir** para o microfone.

> Observação: o GitHub Pages gratuito só funciona com repositório **público**. O código e as lições ficam visíveis,
> mas a sua chave da ElevenLabs e o seu progresso **não** — eles ficam só no seu navegador.

### Opção 2: no seu computador

1. Clique em **Code → Download ZIP** e descompacte.
2. Abra um terminal dentro da pasta e rode: `python -m http.server 8000`
3. No Chrome, abra `http://localhost:8000`.

(Abrir o `index.html` com dois cliques também funciona, mas o Chrome pode pedir permissão do microfone toda vez.)

## Como pegar a chave da ElevenLabs

elevenlabs.io → clique no seu perfil → **API Keys** → **Create API Key**. Copie e cole em *Configurações* no app.
O modelo *Flash v2.5* gasta metade dos créditos do *Multilingual v2*.

## Como pegar a chave da Microsoft (avaliação por fonema)

1. Entre em portal.azure.com (dá para criar a conta grátis).
2. **Create a resource** → procure **Speech** → Create.
3. Escolha uma região (ex.: *East US*) e o plano **Free F0**. Crie.
4. Abra o recurso → **Keys and Endpoint** → copie a **Key 1** e a **Location/Region**.
5. No app: *Configurações → Como avaliar a sua fala* → Microsoft → cole a chave, escolha a mesma região → Salvar.

## Adicionar ou editar lições

As lições estão em [`js/lessons.js`](js/lessons.js). Copie um bloco de lição, mude o `id` (ex.: `"l7"`) e escreva as frases.
Para frases rápidas, use a aba **Minhas frases** dentro do app.

## Para desenvolvedores

Sem build, só HTML/CSS/JS. Teste da comparação de palavras: `node tests/compare.test.js`.

## Próximos passos (ideias)

- Pares mínimos e lições de sons difíceis para brasileiros (th, h, -ed, vogais curtas e longas).
- Nota por fonema e entonação com o Microsoft Pronunciation Assessment (camada gratuita).
- Clipes do YouTube para shadowing.
