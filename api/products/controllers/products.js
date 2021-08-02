'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
const recaptcha = require('recaptcha-validator');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.products.search(ctx.query);
    } else {
      entities = await strapi.services.products.find(ctx.query);
    }

    entities = entities.map((v, i) => {
      v.user?delete v.user.email:null;
      return v
    })

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.products }));
  },
  async create(ctx) {

    if (!ctx.state.user?.id) {
      return ctx.badRequest(`Not Allowed.`);
    } else {
      ctx.request.body.user = ctx.state.user;
      ctx.request.body.user_id = ctx.state.user.id;
    }

    try { // TODO: uncomment
      await recaptcha(process.env.RECAPTCHA_SECERET, ctx.request.body.recaptcha);
    } catch {
      return ctx.badRequest(`Failed recaptcha`);
    }

    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.products.create(data, { files });
    } else {
      entity = await strapi.services.products.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.products });
  },
  async delete(ctx) {

    let entity = await strapi.services.products.findOne({id: parseInt(ctx.params.id)});

    if (!ctx.state.user?.id || ctx.state.user?.id !== entity?.user_id) {
      return ctx.badRequest(`Not Allowed.`);
    }

    entity = await strapi.services.products.delete({id: parseInt(ctx.params.id)});

    return sanitizeEntity(entity, { model: strapi.models.products });

  }
};
