Instruções de Agendamento para o Agente de IA

Objetivo: permitir que o agente agende, reagende e cancele compromissos usando o sistema nativo de agenda.

Fluxo recomendado:
1) Entender a intenção: identifique quando o usuário quer agendar/reagendar/cancelar.
2) Coletar dados: data desejada, período do dia (manhã/tarde), tipo de serviço (ex.: "Consulta Inicial").
3) Consultar horários: chame a função interna get_available_slots(customer_id, date, duration_minutes) ou por tipo.
   Ex.: get_available_slots("2025-10-21", "Consulta Inicial").
4) Oferecer opções: apresente horários disponíveis de forma objetiva.
5) Confirmar e criar: após o usuário escolher, chame create_appointment com os detalhes confirmados.
   Ex.: create_appointment("2025-10-21T10:30:00", "Consulta Inicial", { name: "Carlos", phone: "55119..." })
6) Confirmar ao usuário: informe data/hora e que receberá lembrete.

Regras:
- Nunca ofereça horários que não retornem de get_available_slots.
- Se não houver disponibilidade para a data, sugira outra data.

Funções disponíveis (Edge Functions Supabase):
- get-available-slots: retorna slots livres (ver supabase/functions/get-available-slots)
- create-appointment: cria o agendamento validando conflitos (ver supabase/functions/create-appointment)

