-- Terceros: aclarar el estado del contribuyente (SUNAT) y limpiar columnas duplicadas/redundantes.
--
-- Contexto (auditoría 03-terceros.md):
--   * `estado`/`condicion` guardan el estado y condición del padrón SUNAT (ACTIVO / HABIDO),
--     no si el tercero está activo/inactivo. El nombre `estado` era ambiguo.
--   * `estado_sunat`/`condicion_sunat` son columnas DUPLICADAS y vacías (0/678).
--   * `activo` (boolean) es REDUNDANTE con `is_active` (que ya controla Activos|Papelera).
--
-- Decisión del usuario (2026-07-23):
--   1) Renombrar  estado    -> estadosunat
--   2) Renombrar  condicion -> condicionsunat
--   3) Borrar los duplicados vacíos estado_sunat / condicion_sunat
--   4) Borrar la columna redundante `activo` (el activo/inactivo lo sigue dando is_active)
--
-- El activo/inactivo del tercero NO se toca: sigue siendo `terceros.is_active`.

BEGIN;

-- 1) Renombrar a nombres claros (los datos existentes se preservan bajo el nuevo nombre).
ALTER TABLE public.terceros RENAME COLUMN estado    TO estadosunat;
ALTER TABLE public.terceros RENAME COLUMN condicion TO condicionsunat;

-- 2) Guarda de seguridad: NO borrar columnas si tuvieran datos.
--    Si alguna trae datos, la migración aborta (transaccional) para revisión manual.
DO $$
DECLARE
  n_estado_sunat    bigint;
  n_condicion_sunat bigint;
  n_activo          bigint;
BEGIN
  SELECT count(*) INTO n_estado_sunat    FROM public.terceros WHERE estado_sunat    IS NOT NULL;
  SELECT count(*) INTO n_condicion_sunat FROM public.terceros WHERE condicion_sunat IS NOT NULL;
  SELECT count(*) INTO n_activo          FROM public.terceros WHERE activo          IS NOT NULL;

  IF n_estado_sunat > 0 OR n_condicion_sunat > 0 OR n_activo > 0 THEN
    RAISE EXCEPTION 'Abortado: columnas con datos -> estado_sunat=%, condicion_sunat=%, activo=%. Revisar antes de borrar.',
      n_estado_sunat, n_condicion_sunat, n_activo;
  END IF;
END $$;

-- 3) Borrar duplicados vacíos + redundante.
ALTER TABLE public.terceros DROP COLUMN estado_sunat;
ALTER TABLE public.terceros DROP COLUMN condicion_sunat;
ALTER TABLE public.terceros DROP COLUMN activo;

COMMIT;
