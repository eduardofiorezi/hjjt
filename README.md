# HJJT – Horse Jiu-Jitsu Team

Site da equipe em [equipehjjt.com.br](https://equipehjjt.com.br), feito com [Astro](https://astro.build).

## Rodar no computador

```sh
npm install
npm run dev      # abre em http://localhost:4321
npm run build    # gera o site em dist/
```

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Sedes, horários, responsáveis e contatos | `src/data/sedes.yaml` |
| E-mail, redes sociais, vídeos e nomes dos álbuns | `src/data/site.ts` |
| Fotos (cada pasta é um álbum) | `src/assets/fotos/<album>/` |

O build valida o `sedes.yaml`: dia da semana ou horário em formato errado faz o build falhar com a linha do problema.

## Publicação

O workflow `.github/workflows/deploy.yml` publica no GitHub Pages a cada push na branch `main`.
Antes da primeira publicação, mude em **Settings → Pages → Source** para **GitHub Actions**.
O site antigo continua na branch `gh-pages` até essa troca.

## Google e Google Maps

Cada sede tem uma página própria (`/sedes/<id>/`) com dados estruturados `schema.org` (`SportsActivityLocation`)
e entra no `sitemap-index.xml`. Para aparecer no Google Maps, cada sede precisa de um Perfil da Empresa no Google
apontando para a página dela no site.
