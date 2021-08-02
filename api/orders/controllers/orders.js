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
    if (ctx.state?.user?.id) {
      if (ctx.query.type === "customer") {
        entities = await strapi.services.orders.find({user_id: ctx.state.user.id});
      } else {
        entities = await strapi.services.orders.find({owner_id: ctx.state.user.id});
      }
    } else {
      return ctx.badRequest(`Not Allowed.`);
    }

    entities = entities.map(entity => {

      entity.product = entity.product?.title
      entity.service = entity.service?.title
      return entity
    })


    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.orders }));
  },

  async create(ctx) {

    if (!ctx.state.user?.id) {
      return ctx.badRequest(`Not Allowed.`);
    } else {
      ctx.request.body.user = ctx.state.user;
      ctx.request.body.user_id = ctx.state.user.id;
    }

    if (ctx.request.body.type === "products") {
      let product = await strapi.services.products.findOne({id: parseInt(ctx.request.body.item_id)});
      if (product) {
        if (product.user.id === ctx.state.user.id) return ctx.badRequest(`You can't order your own Product`);
        ctx.request.body.product = product
        ctx.request.body.owner_id = product.user.id
      } else {
        return ctx.badRequest(`No Product found.`);
      }

    } else if (ctx.request.body.type === "services") {
      let service = await strapi.services.services.findOne({id: parseInt(ctx.request.body.item_id)});
      if (service) {
        if (service.user.id === ctx.state.user.id) return ctx.badRequest(`You can't order your own Service`);
        ctx.request.body.service = service
        ctx.request.body.owner_id = service.user.id
      } else {
        return ctx.badRequest(`No Service found.`);
      }
    }

    ctx.request.body.user_id = ctx.state.user.id;


    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.orders.create(data, { files });
    } else {
      entity = await strapi.services.orders.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.orders });
  },
};
