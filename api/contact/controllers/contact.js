'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
const recaptcha = require('recaptcha-validator');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {

    try {
      await recaptcha(process.env.RECAPTCHA_SECERET, ctx.request.body.recaptcha);
    } catch {
      ctx.send({error: 'Failed recaptcha'});
      return;
    }

    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.contact.create(data, { files });
    } else {
      entity = await strapi.services.contact.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.contact });
  },

};
