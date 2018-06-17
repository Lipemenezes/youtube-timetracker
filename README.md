# YouTube Timetracker
Aplicação desenvolvida para que o usuário, dado um tempo disponível em cada dia da semana, saiba quanto tempo levará para assistir todos os videos sobre um determinado assunto.


### Rodando o projeto
É necessário ter o [Node.js](https://nodejs.org/en/download/) instalado para execução do projeto.

Após fazer o clone do repositório, é necessário acessar o arquivo `config.json`, que fica na pasta raiz do projeto, e inserir uma chave do google para a API v3 do YouTube.

Para conseguir a chave da api, é preciso acessar o seu [console do google cloud.](https://console.cloud.google.com/apis/credentials)

Após essa configuração, deve-se acessar o diretório do projeto e rodar os seguintes comandos:

`npm install` para instalar as dependências.

`npm start` para iniciar a aplicação.

Feito isso, o servidor estará rodando no `localhost:3000`
