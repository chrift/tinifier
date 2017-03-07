#!/usr/bin/env node

/**
 * Created by ChrisCheshire on 07/03/2017.
 */

'use strict';

const request = require('request'),
			tinify  = require('tinify'),
			cheerio = require('cheerio'),
			fs      = require('fs-extra'),
			url     = require('url'),
			path    = require('path'),
			_       = require('lodash'),
			debug   = require('debug')('tinifier:index');

tinify.key = fs.readFileSync(path.join('.', 'tinifyKey'));

const pageUrl       = process.argv[2],
			parsedPageUrl = url.parse(pageUrl);

if (!pageUrl || !parsedPageUrl.protocol) {
		console.error('Please supply full url');
		console.error('e.g. npm run tinify https://www.google.com');

		process.exit(1);
}

request(pageUrl, (err, response, body) => {
		let $       = cheerio.load(body),
				$images = $('img');

		let imageUrls = $images.map((i, elem) => {
				let imageUrl       = $(elem).attr('src'),
						parsedImageUrl = url.parse(imageUrl);

				if (parsedImageUrl.host !== parsedPageUrl.host)
						return;

				return parsedImageUrl;
		});

		_.each(imageUrls, (parsedUrl) => {
				let outputFile = path.join('.', 'output', parsedUrl.host, parsedUrl.path);

				fs.ensureFileSync(outputFile);

				var source = tinify.fromUrl(parsedUrl.href);
				source.toFile(outputFile);

				debug('Saved ', parsedUrl.href);
		});

		debug('Done');
});