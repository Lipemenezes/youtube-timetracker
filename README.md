# youtube timetracker
Aplicação desenvolvida para que o usuário, dado um tempo disponível em cada dia da semana, saiba quanto tempo levará para assistir todos os videos sobre um determinado assunto.


### front-end

CONFIG: 
- cadastro de minutos disponíveis por dia da semana
- cadastro da chave do youtube pela interface
	
TELA DE BUSCA:
- palavras chave da busca
- limite de videos (o máximo disponível para seleção será 200)

### back-end

API youtube-timetracker:
- end-point para retornar informações de tempo para uma determinada consulta (devem ser enviados: termos da pesquisa e limite de videos)
- end-point para configurações (minutos/dia e chave do youtube)


wrapper para API do youtube - 
- autenticador - retorna um objeto para acesso a API do youtube (já autenticado - buscar chave do banco)
- buscador - calcula o tempo necessário para assistir todos os videos que se enquadram em uma busca:
    * listar todos os videos (de 50 em 50, por conta do limite da API - maxímo 200 videos)
    * pegar informações de tempo todos os videos listados (de 50 em 50, por conta do limite da API)
    * desconsiderar videos maiores que o dia com maior tempo disponível para ver videos
    * contar as palavras usadas nos títulos e descrições de todos os videos e fazer um top 5
    * considerando a data atual da consulta (dia da semana), montar o cronograma de videos
    * calcular o número de dias necessários para assistir todos os videos, data de início e data de fim
