import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use o formato "HH:MM", ex.: "19:30"');

const sedes = defineCollection({
  loader: file('src/data/sedes.yaml'),
  schema: z.object({
    nome: z.string(),
    endereco: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string(),
    uf: z.string().length(2),
    coordenadas: z.tuple([z.number(), z.number()]),
    responsaveis: z.array(z.string()).default([]),
    telefone: z.string().optional(),
    instagram: z.string().regex(/^[\w.]+$/, 'Só o usuário, sem @ nem link').optional(),
    site: z.url().optional(),
    horarios: z
      .array(
        z.object({
          dias: z.array(z.enum(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'])).min(1),
          inicio: hora,
          fim: hora.optional(),
          turma: z.string().optional(),
          professor: z.string().optional(),
        }),
      )
      .default([]),
    observacoes: z.array(z.string()).default([]),
  }),
});

export const collections = { sedes };
