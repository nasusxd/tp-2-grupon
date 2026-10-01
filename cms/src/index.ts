import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('[AUTH-EXT] Extendiendo users-permissions desde index.ts');

    const plugin = strapi.plugin('users-permissions');
    const originalController = plugin.controller('auth');
    const originalRegister = originalController.register;

    originalController.register = async (ctx: any, next: any) => {
      const { tipo_usuario } = ctx.request.body;
      strapi.log.info(`[AUTH-EXT] register interceptado. tipo_usuario=${tipo_usuario}`);

      await originalRegister(ctx, next);

      if (ctx.response.status === 200 && ctx.body?.user && tipo_usuario) {
        const rolDeseado = tipo_usuario === 'profesor' ? 'Profesor' : 'Alumno';

        const rol: any = await strapi
          .query('plugin::users-permissions.role')
          .findOne({ where: { name: rolDeseado } });

        strapi.log.info(
          `[AUTH-EXT] rol: ${rol ? `id=${rol.id}, name=${rol.name}` : 'NO ENCONTRADO'}`
        );

        if (rol) {
          await strapi.documents('plugin::users-permissions.user').update({
            documentId: ctx.body.user.documentId,
            data: {
              tipo_usuario: tipo_usuario,
              role: rol.id,
            },
          } as any);

          strapi.log.info(
            `[AUTH-EXT] usuario ${ctx.body.user.id} actualizado con role=${rol.name}`
          );
        }
      }
    };
  },

  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};