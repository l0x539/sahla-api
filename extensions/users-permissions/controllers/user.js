const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Update a record.
   *
   * @return {Object}
   */
   async findOne(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.query('user', 'users-permissions').findOne({ id });
    delete entity.email;
    delete entity.provider;
    delete entity.role;
    delete entity.updated_at;
    return sanitizeEntity(entity, { model: strapi.plugins['users-permissions'].models.user });
  },

  async update(ctx) {

    const { id } = ctx.state.user;

    if (id !== parseInt(ctx.params.id)) return ctx.throw(400, 'Not Allowed')

    let client = await strapi.query('user', 'users-permissions').findOne({ id });
    // if it doesnt exist then stop here as there is nothing to update.
    if (!client) {
      return ctx.badRequest(`Client was not found.`);
    }

    if (ctx.request.body.avatar) {
      if (client.avatar) {
        const file = await strapi.plugins['upload'].services.upload.fetch({ id: client.avatar.id });
          if (file) {
            await strapi.plugins['upload'].services.upload.remove(file);
          }
      }
    }

    if (ctx.request.body.username || ctx.request.body.newpass) {
      if (!ctx.request.body.cpassword) {
        return ctx.badRequest(`Please Enter your old password.`);
      }

      const validPassword = await strapi.plugins['users-permissions'].services.user.validatePassword(ctx.request.body.cpassword, client.password);

      if (!validPassword) {
        return ctx.badRequest(`Wrong Password.`);
      }

      if (ctx.request.body.newpass) {
        ctx.request.body.password = ctx.request.body.newpass;
        delete ctx.request.body.newpass;
      }
    }


    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);

      entity = await strapi.plugins['users-permissions'].services.user.edit({ id }, data, {
        files: files.avatar,
      });
    } else {
      entity = await strapi.plugins['users-permissions'].services.user.edit({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.plugins['users-permissions'].models.user });
  },
};


